import React from "react";
import { Card, Row, Col, Statistic, Space, Typography } from "antd";
import {
  UserAddOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const cardsData = [
  {
    title: "New Registrations",
    value: 1587,
    icon: <UserAddOutlined />,
    color: "#1890ff",
    bgColor: "#e6f7ff",
    trend: "+12.5%",
    trendUp: true,
  },
  {
    title: "Discontinued Accounts",
    value: 782,
    icon: <StopOutlined />,
    color: "#ff4d4f",
    bgColor: "#fff1f0",
    trend: "-3.2%",
    trendUp: false,
  },
  {
    title: "Active Accounts",
    value: 15,
    icon: <CheckCircleOutlined />,
    color: "#52c41a",
    bgColor: "#f6ffed",
    trend: "+5.1%",
    trendUp: true,
  },
  {
    title: "Inactive Accounts",
    value: 1890,
    icon: <ClockCircleOutlined />,
    color: "#faad14",
    bgColor: "#fffbe6",
    trend: "-1.8%",
    trendUp: false,
  },
  {
    title: "Suspect Leads",
    value: 1890,
    icon: <UserOutlined />,
    color: "#722ed1",
    bgColor: "#f9f0ff",
    trend: "+8.3%",
    trendUp: true,
  },
  {
    title: "Pending Tasks",
    value: 1890,
    icon: <FileTextOutlined />,
    color: "#13c2c2",
    bgColor: "#e6fffb",
    trend: "+15.2%",
    trendUp: true,
  },
];

const DashboardCards = () => {
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]}>
        {cardsData.map((card, index) => (
          <Col xs={24} sm={12} md={8} lg={8} xl={4} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                height: "100%",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              {/* Header - Icon and Title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                  }}
                >
                  {card.title}
                </Text>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: card.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 20, color: card.color }}>
                    {card.icon}
                  </span>
                </div>
              </div>

              {/* Value */}
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                {formatNumber(card.value)}
              </div>

              {/* Trend */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {card.trendUp ? (
                  <ArrowUpOutlined style={{ color: "#52c41a", fontSize: 12 }} />
                ) : (
                  <ArrowDownOutlined style={{ color: "#ff4d4f", fontSize: 12 }} />
                )}
                <Text
                  style={{
                    color: card.trendUp ? "#52c41a" : "#ff4d4f",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {card.trend}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  vs last month
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DashboardCards;