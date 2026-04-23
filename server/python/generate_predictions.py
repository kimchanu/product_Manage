import argparse
import json
from datetime import datetime
from urllib import parse, request


DEFAULT_SITES = ["GK", "천마사업소", "을숙도사업소", "강남사업소", "수원사업소"]
DEFAULT_DEPARTMENTS = ["ITS", "기전", "시설"]


def fetch_json(url):
    with request.urlopen(url) as response:
        return json.loads(response.read().decode("utf-8"))


def post_json(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with request.urlopen(req) as response:
        return json.loads(response.read().decode("utf-8"))


def parse_month(month_string):
    return datetime.strptime(month_string, "%Y-%m-%d")


def next_month(month_string):
    date_obj = parse_month(month_string)
    year = date_obj.year + (1 if date_obj.month == 12 else 0)
    month = 1 if date_obj.month == 12 else date_obj.month + 1
    return f"{year}-{month:02d}-01"


def weighted_prediction(values):
    usable = [float(v or 0) for v in values if v is not None]
    if not usable:
        return 0.0

    recent = usable[-3:]
    if len(recent) == 1:
        return recent[0]
    if len(recent) == 2:
        weights = [0.4, 0.6]
    else:
        weights = [0.2, 0.3, 0.5]

    return sum(value * weight for value, weight in zip(recent, weights))


def confidence_level(month_count):
    if month_count >= 24:
        return "high"
    if month_count >= 12:
        return "medium"
    return "low"


def build_prediction_rows(api_base_url, business_location, department, months_back):
    query = parse.urlencode(
        {
            "businessLocation": business_location,
            "department": department,
            "monthsBack": months_back,
        }
    )
    history_url = f"{api_base_url}/api/predictions/history?{query}"
    history_response = fetch_json(history_url)
    history = history_response.get("history", [])

    if not history:
        return []

    last_month = history[-1]["month"]
    target_month = next_month(last_month)
    input_values = [row.get("inputAmount", 0) for row in history]
    output_values = [row.get("outputAmount", 0) for row in history]
    month_count = len(history)

    return [
        {
            "targetType": "input_amount",
            "businessLocation": business_location,
            "department": department,
            "baseMonth": last_month,
            "targetMonth": target_month,
            "predictedValue": round(weighted_prediction(input_values), 2),
            "confidenceLevel": confidence_level(month_count),
            "modelName": "python_weighted_baseline",
            "dataMonths": month_count,
            "notes": "최근 3개월 가중 이동평균 기반 예측",
        },
        {
            "targetType": "output_amount",
            "businessLocation": business_location,
            "department": department,
            "baseMonth": last_month,
            "targetMonth": target_month,
            "predictedValue": round(weighted_prediction(output_values), 2),
            "confidenceLevel": confidence_level(month_count),
            "modelName": "python_weighted_baseline",
            "dataMonths": month_count,
            "notes": "최근 3개월 가중 이동평균 기반 예측",
        },
    ]


def main():
    parser = argparse.ArgumentParser(description="Generate baseline predictions")
    parser.add_argument(
        "--api-base-url",
        default="http://127.0.0.1:5000",
        help="Backend API base URL",
    )
    parser.add_argument(
        "--months-back",
        type=int,
        default=16,
        help="Number of months to use for baseline history",
    )
    parser.add_argument(
        "--sites",
        nargs="*",
        default=DEFAULT_SITES,
        help="Business locations to process",
    )
    parser.add_argument(
        "--departments",
        nargs="*",
        default=DEFAULT_DEPARTMENTS,
        help="Departments to process",
    )

    args = parser.parse_args()

    predictions = []

    for site in args.sites:
        for department in args.departments:
            try:
                predictions.extend(
                    build_prediction_rows(
                        args.api_base_url,
                        site,
                        department,
                        args.months_back,
                    )
                )
                print(f"[OK] {site} / {department}")
            except Exception as error:
                print(f"[SKIP] {site} / {department}: {error}")

    if not predictions:
        print("No predictions generated.")
        return

    save_url = f"{args.api_base_url}/api/predictions/bulk"
    result = post_json(save_url, {"predictions": predictions})
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
