import Image from "next/image";

import { TradeForm } from "@/features/trade-entry/ui/trade-form";
import { SkipForm } from "@/features/skip-entry/ui/skip-form";
import { useState } from "react";
import type { ChangeEvent } from "react";

import { getDayTitleLabel } from "@/shared/lib/date";
import type { DayAttachment, DayRecord, MoodTag, SkippedTradeRecord, TradeRecord, TradeResult, ViolationTag } from "@/shared/types/trading";

interface DayDetailsProps {
  dayRecord: DayRecord;
  onAddTrade: (trade: TradeRecord) => void;
  onUpdateTrade: (trade: TradeRecord) => void;
  onDeleteTrade: (tradeId: string) => void;
  onAddSkipped: (record: SkippedTradeRecord) => void;
  onUpdateSkipped: (record: SkippedTradeRecord) => void;
  onDeleteSkipped: (recordId: string) => void;
  onUpdateComment: (comment: string) => void;
  onUpdateMood: (mood?: MoodTag) => void;
  onToggleNoTradeDay: (checked: boolean) => void;
  onAddAttachments: (files: File[]) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}

const moodOptions: Array<{ value: MoodTag; label: string }> = [
  { value: "calm", label: "Calm" },
  { value: "neutral", label: "Neutral" },
  { value: "stressed", label: "Stressed" },
  { value: "tilted", label: "Tilted" },
];

const violationOptions: Array<{ label: string; value: ViolationTag }> = [
  { label: "FOMO", value: "fomo" },
  { label: "Revenge", value: "revenge" },
  { label: "Overtrade", value: "overtrade" },
  { label: "Impulse", value: "impulse" },
  { label: "Other", value: "other" },
];

export const DayDetails = ({
  dayRecord,
  onAddTrade,
  onUpdateTrade,
  onDeleteTrade,
  onAddSkipped,
  onUpdateSkipped,
  onDeleteSkipped,
  onUpdateComment,
  onUpdateMood,
  onToggleNoTradeDay,
  onAddAttachments,
  onRemoveAttachment,
}: DayDetailsProps) => {
  const [previewAttachment, setPreviewAttachment] = useState<DayAttachment | null>(null);
  const [tradeDraft, setTradeDraft] = useState<TradeRecord | null>(null);
  const [skippedDraft, setSkippedDraft] = useState<SkippedTradeRecord | null>(null);
  const dayTitle = getDayTitleLabel(dayRecord.date);
  const dayTradeCount = dayRecord.trades.length;
  const dayWins = dayRecord.trades.filter((trade) => trade.result === "win").length;
  const dayLosses = dayTradeCount - dayWins;
  const dayByPlan = dayRecord.trades.filter((trade) => trade.byPlan).length;
  const dayOffPlan = dayTradeCount - dayByPlan;
  const dayAvgRr =
    dayTradeCount > 0
      ? (dayRecord.trades.reduce((sum, trade) => sum + trade.rr, 0) / dayTradeCount).toFixed(2)
      : "0.00";
  const skippedCount = dayRecord.skippedTrades.length;
  const skippedTotalRr = dayRecord.skippedTrades.reduce((sum, item) => sum + item.hypotheticalRr, 0).toFixed(2);

  const handleAttach = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    onAddAttachments(files);
    event.target.value = "";
  };

  return (
    <section className="details">
      <h2>Детали дня: {dayTitle}</h2>
      <div className="details__top">
        <div className="details__meta">
          <label className="details__comment">
            Комментарий по дню
            <textarea
              value={dayRecord.comment}
              onChange={(event) => onUpdateComment(event.target.value)}
              rows={3}
              placeholder="Что было по плану, где была слабость, выводы..."
            />
          </label>
        </div>

        <div className="details__side">
          <label>
            Эмоциональное состояние
            <select
              value={dayRecord.mood ?? ""}
              onChange={(event) => onUpdateMood(event.target.value ? (event.target.value as MoodTag) : undefined)}
            >
              <option value="">Не указано</option>
              {moodOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="details__no-trade">
            <input
              type="checkbox"
              checked={Boolean(dayRecord.noTradeDay)}
              onChange={(event) => onToggleNoTradeDay(event.target.checked)}
            />
            <span>День без сделок</span>
          </label>
        </div>
      </div>

      <div className="details__divider" />

      <div className="details__forms">
        <TradeForm onAddTrade={onAddTrade} />
        <SkipForm onAddSkipped={onAddSkipped} />
      </div>

      {(tradeDraft || skippedDraft) && (
        <article className="edit-panel">
          {tradeDraft && (
            <>
              <h3>Редактировать сделку</h3>
              <div className="edit-panel__grid">
                <input
                  value={tradeDraft.asset}
                  onChange={(event) =>
                    setTradeDraft({
                      ...tradeDraft,
                      asset: event.target.value,
                    })
                  }
                  placeholder="Актив"
                />
                <select
                  value={tradeDraft.result}
                  onChange={(event) =>
                    setTradeDraft({
                      ...tradeDraft,
                      result: event.target.value as TradeResult,
                    })
                  }
                >
                  <option value="win">Win</option>
                  <option value="lose">Lose</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={tradeDraft.rr}
                  onChange={(event) =>
                    setTradeDraft({
                      ...tradeDraft,
                      rr: Number(event.target.value),
                    })
                  }
                />
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={tradeDraft.byPlan}
                    onChange={(event) =>
                      setTradeDraft({
                        ...tradeDraft,
                        byPlan: event.target.checked,
                      })
                    }
                  />
                  По плану
                </label>
                {!tradeDraft.byPlan && (
                  <select
                    value={tradeDraft.violationTag ?? "fomo"}
                    onChange={(event) =>
                      setTradeDraft({
                        ...tradeDraft,
                        violationTag: event.target.value as ViolationTag,
                      })
                    }
                  >
                    {violationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateTrade(tradeDraft);
                    setTradeDraft(null);
                  }}
                >
                  Сохранить
                </button>
                <button type="button" onClick={() => setTradeDraft(null)}>
                  Отмена
                </button>
              </div>
            </>
          )}

          {skippedDraft && (
            <>
              <h3>Редактировать пропущенную сделку</h3>
              <div className="edit-panel__grid">
                <input
                  value={skippedDraft.asset}
                  onChange={(event) =>
                    setSkippedDraft({
                      ...skippedDraft,
                      asset: event.target.value,
                    })
                  }
                  placeholder="Актив"
                />
                <input
                  value={skippedDraft.reason}
                  onChange={(event) =>
                    setSkippedDraft({
                      ...skippedDraft,
                      reason: event.target.value,
                    })
                  }
                  placeholder="Причина"
                />
                <select
                  value={skippedDraft.hypotheticalResult}
                  onChange={(event) =>
                    setSkippedDraft({
                      ...skippedDraft,
                      hypotheticalResult: event.target.value as TradeResult,
                    })
                  }
                >
                  <option value="win">Win</option>
                  <option value="lose">Lose</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={skippedDraft.hypotheticalRr}
                  onChange={(event) =>
                    setSkippedDraft({
                      ...skippedDraft,
                      hypotheticalRr: Number(event.target.value),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSkipped(skippedDraft);
                    setSkippedDraft(null);
                  }}
                >
                  Сохранить
                </button>
                <button type="button" onClick={() => setSkippedDraft(null)}>
                  Отмена
                </button>
              </div>
            </>
          )}
        </article>
      )}

      <div className="details__divider" />

      <div className="details__bottom">
        <article className="attachments">
          <h3>Скриншоты дня</h3>
          <label>
            Прикрепить изображения
            <input type="file" accept="image/*" multiple onChange={handleAttach} />
          </label>
          <div className="attachments__grid">
            {dayRecord.attachments.map((attachment) => (
              <figure key={attachment.id} className="attachments__item">
                <button type="button" className="attachments__open" onClick={() => setPreviewAttachment(attachment)}>
                  <Image
                    src={attachment.url}
                    alt={attachment.name}
                    width={280}
                    height={140}
                    unoptimized
                    className="attachments__preview"
                  />
                </button>
                <div className="attachments__meta">
                  <figcaption>{attachment.name}</figcaption>
                  <button type="button" className="attachments__remove" onClick={() => onRemoveAttachment(attachment.id)}>
                    Удалить
                  </button>
                </div>
              </figure>
            ))}
          </div>
        </article>

        <article className="day-info">
          <h3>Инфо по сделкам дня</h3>
          <p>W/L: {dayWins}/{dayLosses}</p>
          <p>По плану / Вне плана: {dayByPlan} / {dayOffPlan}</p>
          <p>Avg. RR: {dayAvgRr}</p>
          <p>Пропущенные сделки / RR: {skippedCount} / {skippedTotalRr}</p>

          <div className="day-info__list">
            {dayRecord.trades.slice(-4).map((trade) => (
              <p key={trade.id}>
                {trade.asset} / {trade.result} / RR {trade.rr}
                <button type="button" onClick={() => setTradeDraft(trade)}>
                  Ред.
                </button>
                <button type="button" onClick={() => onDeleteTrade(trade.id)}>
                  Удал.
                </button>
              </p>
            ))}
            {dayRecord.trades.length === 0 && <p>Сделок пока нет.</p>}
            {dayRecord.skippedTrades.slice(-4).map((record) => (
              <p key={record.id}>
                {record.asset} / {record.hypotheticalResult} / RR {record.hypotheticalRr}
                <button type="button" onClick={() => setSkippedDraft(record)}>
                  Ред.
                </button>
                <button type="button" onClick={() => onDeleteSkipped(record.id)}>
                  Удал.
                </button>
              </p>
            ))}
          </div>
        </article>
      </div>

      {previewAttachment && (
        <div className="preview-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="preview-modal__backdrop"
            aria-label="Закрыть превью"
            onClick={() => setPreviewAttachment(null)}
          />
          <div className="preview-modal__content">
            <Image
              src={previewAttachment.url}
              alt={previewAttachment.name}
              width={1280}
              height={820}
              unoptimized
              className="preview-modal__image"
            />
            <div className="preview-modal__footer">
              <span>{previewAttachment.name}</span>
              <button type="button" onClick={() => setPreviewAttachment(null)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
