import Image from "next/image";

import { TradeForm } from "@/features/trade-entry/ui/trade-form";
import { SkipForm } from "@/features/skip-entry/ui/skip-form";
import type { ChangeEvent } from "react";

import type { DayAttachment, DayRecord, MoodTag, SkippedTradeRecord, TradeRecord } from "@/shared/types/trading";

interface DayDetailsProps {
  dayRecord: DayRecord;
  onAddTrade: (trade: TradeRecord) => void;
  onAddSkipped: (record: SkippedTradeRecord) => void;
  onUpdateComment: (comment: string) => void;
  onUpdateMood: (mood?: MoodTag) => void;
  onAddAttachments: (attachments: DayAttachment[]) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}

const moodOptions: Array<{ value: MoodTag; label: string }> = [
  { value: "calm", label: "Calm" },
  { value: "neutral", label: "Neutral" },
  { value: "stressed", label: "Stressed" },
  { value: "tilted", label: "Tilted" },
];

export const DayDetails = ({
  dayRecord,
  onAddTrade,
  onAddSkipped,
  onUpdateComment,
  onUpdateMood,
  onAddAttachments,
  onRemoveAttachment,
}: DayDetailsProps) => {
  const toDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Не удалось прочитать файл."));
      reader.readAsDataURL(file);
    });

  const handleAttach = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const attachments = await Promise.all(
      files.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        dataUrl: await toDataUrl(file),
        createdAt: new Date().toISOString(),
      })),
    );

    onAddAttachments(attachments);
    event.target.value = "";
  };

  return (
    <section className="details">
      <h2>Детали дня: {dayRecord.date}</h2>
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

      <label>
        Комментарий по дню
        <textarea
          value={dayRecord.comment}
          onChange={(event) => onUpdateComment(event.target.value)}
          rows={3}
          placeholder="Что было по плану, где была слабость, выводы..."
        />
      </label>

      <div className="details__forms">
        <TradeForm onAddTrade={onAddTrade} />
        <SkipForm onAddSkipped={onAddSkipped} />
      </div>

      <article className="attachments">
        <h3>Скриншоты дня</h3>
        <label>
          Прикрепить изображения
          <input type="file" accept="image/*" multiple onChange={handleAttach} />
        </label>
        {dayRecord.attachments.length === 0 && <p>Скриншоты не добавлены.</p>}
        <div className="attachments__grid">
          {dayRecord.attachments.map((attachment) => (
            <figure key={attachment.id} className="attachments__item">
              <Image
                src={attachment.dataUrl}
                alt={attachment.name}
                width={280}
                height={140}
                unoptimized
                className="attachments__preview"
              />
              <figcaption>{attachment.name}</figcaption>
              <button type="button" onClick={() => onRemoveAttachment(attachment.id)}>
                Удалить
              </button>
            </figure>
          ))}
        </div>
      </article>

      <div className="details__lists">
        <article>
          <h3>Сделки дня</h3>
          {dayRecord.trades.length === 0 && <p>Сделок нет.</p>}
          {dayRecord.trades.map((trade) => (
            <p key={trade.id}>
              {trade.asset} • {trade.positionType} • {trade.result} • RR {trade.rr} •{" "}
              {trade.byPlan ? "по плану" : `не по плану (${trade.violationTag ?? "other"})`}
            </p>
          ))}
        </article>
        <article>
          <h3>Пропущенные невалидные входы</h3>
          {dayRecord.skippedTrades.length === 0 && <p>Записей нет.</p>}
          {dayRecord.skippedTrades.map((record) => (
            <p key={record.id}>
              {record.reason} • {record.hypotheticalResult} • RR {record.hypotheticalRr}
            </p>
          ))}
        </article>
      </div>
    </section>
  );
};
