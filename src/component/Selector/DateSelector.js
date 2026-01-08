import React from "react";

const DateSelector = ({ year, month, onYearChange, onMonthChange }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // 최근 5년
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="flex items-center gap-4">
            <select
                value={year}
                onChange={(e) => onYearChange(parseInt(e.target.value))}
                className="border rounded-md px-3 py-1"
            >
                {years.map((y) => (
                    <option key={y} value={y}>{y}년</option>
                ))}
            </select>
            <select
                value={month}
                onChange={(e) => onMonthChange(parseInt(e.target.value))}
                className="border rounded-md px-3 py-1"
            >
                {months.map((m) => (
                    <option key={m} value={m}>{m}월</option>
                ))}
            </select>
        </div>
    );
};

export default DateSelector;
