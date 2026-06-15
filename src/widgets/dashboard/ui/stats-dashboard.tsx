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
          <span className="kpi-card__label">Пустых (серых)</span>
          <strong>{metrics.grayDays}</strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__label">Дисциплина</span>
          <strong>{metrics.greenDaysPercent}%</strong>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__label">Серия по плану</span>
          <strong>{metrics.longestDisciplineStreak} дн.</strong>
        </article>
      </div>

      <div className="dashboard__grid">
        <article className="dashboard-card">
          <h3>Сделки</h3>
          <p>По плану: {metrics.byPlanTrades}</p>
          <p>Вне плана: {metrics.offPlanTrades}</p>
          <p>Winrate по плану: {metrics.byPlanWinrate}%</p>
          <p>Winrate вне плана: {metrics.offPlanWinrate}%</p>
        </article>
        <article className="dashboard-card">
          <h3>RR аналитика</h3>
          <p>Средний RR по плану: {metrics.avgByPlanRr}</p>
          <p>Средний RR вне плана: {metrics.avgOffPlanRr}</p>
          <p>Пропущенные win/lose: {metrics.skippedWins}/{metrics.skippedLosses}</p>
          <p>Суммарный RR пропусков: {metrics.skippedTotalRr}</p>
        </article>
        <article className="dashboard-card">
          <h3>Вывод по пропускам</h3>
          <p>{metrics.skippedOutcomeText}</p>
        </article>
      </div>
      <p className="dashboard__motivation">{metrics.motivation}</p>
    </section>
  );
};
