import React, { useMemo } from "react";

const AssignmentAnalytics = ({ assignedSuspects }) => {
  // Calculate assignment analytics
  const analytics = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayAssignments = assignedSuspects.filter((suspect) => {
      const assignedDate = new Date(suspect.assignedAt);
      return assignedDate.toDateString() === today.toDateString();
    });

    const yesterdayAssignments = assignedSuspects.filter((suspect) => {
      const assignedDate = new Date(suspect.assignedAt);
      return assignedDate.toDateString() === yesterday.toDateString();
    });

    const thisWeekAssignments = assignedSuspects.filter((suspect) => {
      const assignedDate = new Date(suspect.assignedAt);
      return assignedDate >= startOfWeek;
    });

    const thisMonthAssignments = assignedSuspects.filter((suspect) => {
      const assignedDate = new Date(suspect.assignedAt);
      return assignedDate >= startOfMonth;
    });

    // Calculate monthly data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString("default", { month: "short" });
      const monthYear = `${monthName} ${month.getFullYear()}`;

      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthAssignments = assignedSuspects.filter((suspect) => {
        const assignedDate = new Date(suspect.assignedAt);
        return assignedDate >= monthStart && assignedDate <= monthEnd;
      });

      monthlyData.push({
        month: monthYear,
        count: monthAssignments.length,
      });
    }

    // Calculate daily data (last 7 days)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = day.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dayAssignments = assignedSuspects.filter((suspect) => {
        const assignedDate = new Date(suspect.assignedAt);
        return assignedDate.toDateString() === day.toDateString();
      });

      dailyData.push({
        day: dayName,
        date: dateStr,
        count: dayAssignments.length,
      });
    }

    return {
      today: todayAssignments.length,
      yesterday: yesterdayAssignments.length,
      thisWeek: thisWeekAssignments.length,
      thisMonth: thisMonthAssignments.length,
      totalAssigned: assignedSuspects.length,
      monthlyData,
      dailyData,
    };
  }, [assignedSuspects]);

  return (
    <div className="assignment-analytics">
      <div className="analytics-header">
        <h3>📊 Assignment Analytics</h3>
        <div className="analytics-subtitle">Your Assignment Performance</div>
      </div>

      {/* Main Analytics Cards */}
      <div className="analytics-cards">
        <div className="analytics-card primary">
          <div className="analytics-icon">📅</div>
          <div className="analytics-content">
            <div className="analytics-value">{analytics.today}</div>
            <div className="analytics-label">Today</div>
            <div className="analytics-trend">
              {analytics.yesterday > 0 && (
                <span
                  className={
                    analytics.today >= analytics.yesterday
                      ? "trend-up"
                      : "trend-down"
                  }
                >
                  {analytics.today >= analytics.yesterday ? "↗" : "↘"}
                  {Math.abs(analytics.today - analytics.yesterday)} from
                  yesterday
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="analytics-card success">
          <div className="analytics-icon">📆</div>
          <div className="analytics-content">
            <div className="analytics-value">{analytics.thisWeek}</div>
            <div className="analytics-label">This Week</div>
            <div className="analytics-trend">
              Avg. {Math.round(analytics.thisWeek / 7)} per day
            </div>
          </div>
        </div>

        <div className="analytics-card warning">
          <div className="analytics-icon">📈</div>
          <div className="analytics-content">
            <div className="analytics-value">{analytics.thisMonth}</div>
            <div className="analytics-label">This Month</div>
            <div className="analytics-trend">
              {Math.round(analytics.thisMonth / new Date().getDate())} per day
            </div>
          </div>
        </div>

        <div className="analytics-card info">
          <div className="analytics-icon">🎯</div>
          <div className="analytics-content">
            <div className="analytics-value">{analytics.totalAssigned}</div>
            <div className="analytics-label">Total Assigned</div>
            <div className="analytics-trend">All time assignments</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="analytics-charts">
        {/* Monthly Chart */}
        <div className="chart-container">
          <h4>Monthly Assignments</h4>
          <div className="chart-bars">
            {analytics.monthlyData.map((month, index) => (
              <div key={index} className="chart-bar">
                <div className="bar-label">{month.month}</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${Math.max(
                        10,
                        (month.count /
                          Math.max(
                            ...analytics.monthlyData.map((m) => m.count)
                          )) *
                          80
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="bar-value">{month.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Chart */}
        <div className="chart-container">
          <h4>Last 7 Days</h4>
          <div className="chart-bars daily">
            {analytics.dailyData.map((day, index) => (
              <div key={index} className="chart-bar">
                <div className="bar-label">
                  {day.day}
                  <br />
                  {day.date}
                </div>
                <div className="bar-container">
                  <div
                    className="bar-fill daily"
                    style={{
                      height: `${Math.max(
                        10,
                        (day.count /
                          Math.max(
                            ...analytics.dailyData.map((d) => d.count || 1)
                          )) *
                          80
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="bar-value">{day.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="analytics-summary">
        <div className="summary-item">
          <span className="summary-label">Best Day:</span>
          <span className="summary-value">
            {
              analytics.dailyData.reduce(
                (max, day) => (day.count > max.count ? day : max),
                { count: 0 }
              ).date
            }
            (
            {
              analytics.dailyData.reduce(
                (max, day) => (day.count > max.count ? day : max),
                { count: 0 }
              ).count
            }
            )
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Best Month:</span>
          <span className="summary-value">
            {
              analytics.monthlyData.reduce(
                (max, month) => (month.count > max.count ? month : max),
                { count: 0 }
              ).month
            }
            (
            {
              analytics.monthlyData.reduce(
                (max, month) => (month.count > max.count ? month : max),
                { count: 0 }
              ).count
            }
            )
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Avg/Month:</span>
          <span className="summary-value">
            {Math.round(
              analytics.monthlyData.reduce(
                (sum, month) => sum + month.count,
                0
              ) / 6
            )}
          </span>
        </div>
      </div>

      <style jsx>{`
        .assignment-analytics {
          background: white;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .analytics-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .analytics-header h3 {
          font-size: 24px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 8px 0;
        }

        .analytics-subtitle {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .analytics-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .analytics-card {
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .analytics-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .analytics-card.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .analytics-card.success {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: #065f46;
        }

        .analytics-card.warning {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: #92400e;
        }

        .analytics-card.info {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: #1e40af;
        }

        .analytics-icon {
          font-size: 32px;
          opacity: 0.9;
        }

        .analytics-content {
          flex: 1;
        }

        .analytics-value {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .analytics-label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          opacity: 0.9;
        }

        .analytics-trend {
          font-size: 11px;
          font-weight: 600;
          opacity: 0.8;
        }

        .trend-up {
          color: #10b981;
        }

        .trend-down {
          color: #ef4444;
        }

        .analytics-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 20px;
        }

        .chart-container {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .chart-container h4 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 15px 0;
          text-align: center;
        }

        .chart-bars {
          display: flex;
          justify-content: space-between;
          align-items: end;
          height: 120px;
          gap: 8px;
        }

        .chart-bars.daily {
          height: 100px;
        }

        .chart-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          gap: 8px;
        }

        .bar-label {
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          text-align: center;
          line-height: 1.2;
        }

        .bar-container {
          height: 80px;
          width: 20px;
          background: #e5e7eb;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }

        .chart-bars.daily .bar-container {
          height: 60px;
        }

        .bar-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(to top, #667eea, #764ba2);
          border-radius: 4px;
          transition: height 0.5s ease;
        }

        .bar-fill.daily {
          background: linear-gradient(to top, #10b981, #059669);
        }

        .bar-value {
          font-size: 11px;
          font-weight: 700;
          color: #374151;
        }

        .analytics-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .summary-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }

        .summary-value {
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          background: white;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .analytics-charts {
            grid-template-columns: 1fr;
          }

          .analytics-cards {
            grid-template-columns: 1fr 1fr;
          }

          .analytics-summary {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .analytics-cards {
            grid-template-columns: 1fr;
          }

          .chart-bars {
            gap: 4px;
          }

          .bar-container {
            width: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AssignmentAnalytics;
