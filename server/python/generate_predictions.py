import argparse
import json
import time
from datetime import datetime
from urllib import parse, request


DEFAULT_SITES = [
    "GK",
    "\uCC9C\uB9C8\uC0AC\uC5C5\uC18C",
    "\uC744\uC219\uB3C4\uC0AC\uC5C5\uC18C",
    "\uAC15\uB0A8\uC0AC\uC5C5\uC18C",
    "\uC218\uC6D0\uC0AC\uC5C5\uC18C",
]
DEFAULT_DEPARTMENTS = ["ITS", "\uAE30\uC804", "\uC2DC\uC124"]


def request_json(url, payload=None, method="GET", retries=4, retry_delay=1.5):
    last_error = None

    for attempt in range(retries):
        try:
            if payload is None:
                req = request.Request(url, method=method)
            else:
                data = json.dumps(payload).encode("utf-8")
                req = request.Request(
                    url,
                    data=data,
                    headers={"Content-Type": "application/json"},
                    method=method,
                )

            with request.urlopen(req) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as error:
            last_error = error
            if attempt < retries - 1:
                time.sleep(retry_delay)

    raise last_error


def fetch_json(url):
    return request_json(url)


def post_json(url, payload):
    return request_json(url, payload=payload, method="POST")


def parse_month(month_string):
    return datetime.strptime(month_string, "%Y-%m-%d")


def next_month(month_string):
    date_obj = parse_month(month_string)
    year = date_obj.year + (1 if date_obj.month == 12 else 0)
    month = 1 if date_obj.month == 12 else date_obj.month + 1
    return f"{year}-{month:02d}-01"


def month_key(month_string):
    return month_string[:7]


def completed_history(history):
    if not history:
        return []

    current_month = datetime.now().strftime("%Y-%m")
    filtered = list(history)

    if filtered and month_key(filtered[-1]["month"]) == current_month:
        filtered = filtered[:-1]

    return filtered


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
    raw_history = history_response.get("history", [])
    history = completed_history(raw_history)

    if not history:
        return []

    base_month = raw_history[-1]["month"] if raw_history else history[-1]["month"]
    target_month = next_month(base_month)
    input_values = [row.get("inputAmount", 0) for row in history]
    output_values = [row.get("outputAmount", 0) for row in history]
    month_count = len(history)

    return [
        {
            "targetType": "input_amount",
            "businessLocation": business_location,
            "department": department,
            "baseMonth": base_month,
            "targetMonth": target_month,
            "predictedValue": round(weighted_prediction(input_values), 2),
            "confidenceLevel": confidence_level(month_count),
            "modelName": "python_weighted_baseline",
            "dataMonths": month_count,
            "notes": "최근 3개월 가중 이동평균 기반 금액 예측",
        },
        {
            "targetType": "output_amount",
            "businessLocation": business_location,
            "department": department,
            "baseMonth": base_month,
            "targetMonth": target_month,
            "predictedValue": round(weighted_prediction(output_values), 2),
            "confidenceLevel": confidence_level(month_count),
            "modelName": "python_weighted_baseline",
            "dataMonths": month_count,
            "notes": "최근 3개월 가중 이동평균 기반 금액 예측",
        },
    ]


def build_material_rows(api_base_url, business_location, department, months_back):
    query = parse.urlencode(
        {
            "businessLocation": business_location,
            "department": department,
            "monthsBack": min(months_back, 6),
            "limit": 10,
        }
    )
    material_url = f"{api_base_url}/api/predictions/material-usage?{query}"
    material_response = fetch_json(material_url)
    materials = material_response.get("materials", [])

    if not materials:
        return []

    current_month = datetime.now().strftime("%Y-%m")
    completed_months = []
    cursor = datetime.now().replace(day=1)

    for _ in range(min(months_back, 6)):
        key = cursor.strftime("%Y-%m")
        if key != current_month:
            completed_months.append(f"{key}-01")

        month = cursor.month - 1
        year = cursor.year
        if month == 0:
            month = 12
            year -= 1
        cursor = cursor.replace(year=year, month=month)

    completed_months.reverse()

    if not completed_months:
        return []

    current_month_base = f"{datetime.now().strftime('%Y-%m')}-01"
    base_month = current_month_base
    target_month = next_month(base_month)
    rows = []

    for material in materials:
        monthly = material.get("monthly", {})
        quantity_series = [float(monthly.get(month, 0)) for month in completed_months]
        predicted_quantity = round(weighted_prediction(quantity_series), 2)
        unit_price = float(material.get("unitPrice") or 0)

        if predicted_quantity <= 0:
            continue

        payload = {
            "materialName": material.get("materialName"),
            "materialCode": material.get("materialCode"),
            "predictedQuantity": predicted_quantity,
            "unitPrice": unit_price,
            "recentMonthlyQuantity": quantity_series[-3:],
        }

        rows.append(
            {
                "targetType": "output_material_amount",
                "businessLocation": business_location,
                "department": department,
                "materialId": material.get("materialId"),
                "baseMonth": base_month,
                "targetMonth": target_month,
                "predictedValue": round(predicted_quantity * unit_price, 2),
                "confidenceLevel": confidence_level(len(completed_months)),
                "modelName": "python_weighted_material_baseline",
                "dataMonths": len(completed_months),
                "notes": json.dumps(payload, ensure_ascii=False),
            }
        )

    return rows


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
                predictions.extend(
                    build_material_rows(
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
