import type { MonthlyMetrics } from "@/entities/record/model/metrics";

interface StatsDashboardProps {
  metrics: MonthlyMetrics;
}

export const StatsDashboard = ({ metrics }: StatsDashboardProps) => {
  return (
    <section className="dashboard">
      <h2>Статистика месяца</h2>
      <div className="dashboard__kpis">
        <article className="kpi-card">
          <span className="kpi-card__label">Заполнено дней</span>
          <strong>{metrics.filledDays}</strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__label">Дисциплина</span>
          <strong>{metrics.greenDaysPercent}%</strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__label">Green Стрик</span>
          <strong>{metrics.greenStreak} дн.</strong>
        </article>
      </div>

      <div className="dashboard__grid">
        <article className="dashboard-card">
          <h3>Сделки</h3>
          <p>По плану / Winrate: {metrics.byPlanTrades} / {metrics.byPlanWinrate}%</p>
          <p>Вне плана / Winrate: {metrics.offPlanTrades} / {metrics.offPlanWinrate}%</p>
        </article>
        <article className="dashboard-card">
          <h3>RR аналитика</h3>
          <p>По плану RR / Пропуски W/L: {metrics.avgByPlanRr} / {metrics.skippedWins}/{metrics.skippedLosses}</p>
          <p>Вне плана RR / Пропуски RR: {metrics.avgOffPlanRr} / {metrics.skippedTotalRr}</p>
        </article>
        <article className="dashboard-card dashboard-card--center">
          <h3>Вывод по пропускам</h3>
          <p>{metrics.skippedOutcomeText}</p>
        </article>
      </div>
      {metrics.motivation && <p className="dashboard__motivation">{metrics.motivation}</p>}
    </section>
  );
};
