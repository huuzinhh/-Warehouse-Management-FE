import React, { useState, useEffect } from "react";
import { Input, Select, DatePicker, Row, Col } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

export default function TableFilter({
  data = [],
  onFilter,
  searchFields = [],
  selectFilters = [],
  dateFilters = [], // chỉ dùng mode === "range"
}) {
  const [searchText, setSearchText] = useState("");
  const [selectValues, setSelectValues] = useState({});
  const [dateValues, setDateValues] = useState({});

  useEffect(() => {
    let filtered = [...data];

    // 1. Filter text
    if (searchText) {
      const keyword = searchText.toLowerCase();
      filtered = filtered.filter((item) =>
        searchFields.some((field) =>
          String(item[field] ?? "")
            .toLowerCase()
            .includes(keyword)
        )
      );
    }

    // 2. Filter dropdown
    selectFilters.forEach(({ field }) => {
      const val = selectValues[field];
      if (val !== undefined && val !== "") {
        filtered = filtered.filter((item) => item[field] === val);
      }
    });

    // 3. Filter theo range ngày
    dateFilters.forEach(({ field }) => {
      const range = dateValues[field];
      if (!range || !range[0] || !range[1]) return;

      const start = dayjs(range[0]).startOf("day");
      const end = dayjs(range[1]).endOf("day");

      filtered = filtered.filter((item) => {
        if (!item[field]) return false;
        const itemDate = dayjs(item[field]);
        if (!itemDate.isValid()) return false;

        return (
          itemDate.isSame(start) ||
          itemDate.isSame(end) ||
          (itemDate.isAfter(start) && itemDate.isBefore(end))
        );
      });
    });

    onFilter(filtered);
  }, [searchText, selectValues, dateValues, data]);

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      {/* Search text */}
      {searchFields.length > 0 && (
        <Col>
          <Input
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
      )}

      {/* Dropdown filters */}
      {selectFilters.map(({ field, options, placeholder }, idx) => (
        <Col key={idx}>
          <Select
            placeholder={placeholder || "Chọn"}
            value={selectValues[field]}
            onChange={(val) =>
              setSelectValues((prev) => ({ ...prev, [field]: val }))
            }
            allowClear
            style={{ width: 150 }}
          >
            {options.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Col>
      ))}

      {/* Date range filters */}
      {dateFilters.map(({ field, placeholder }, idx) => (
        <Col key={idx}>
          <DatePicker.RangePicker
            placeholder={placeholder || ["Từ ngày", "Đến ngày"]}
            value={dateValues[field]}
            onChange={(val) =>
              setDateValues((prev) => ({ ...prev, [field]: val }))
            }
          />
        </Col>
      ))}
    </Row>
  );
}
