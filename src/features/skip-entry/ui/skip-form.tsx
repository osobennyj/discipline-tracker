import { useState } from "react";
import type { FormEvent } from "react";

import type { SkippedTradeRecord, TradeResult } from "@/shared/types/trading";

interface SkipFormProps {
  onAddSkipped: (record: SkippedTradeRecord) => void;
}

export const SkipForm = ({ onAddSkipped }: SkipFormProps) => {
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<TradeResult>("lose");
  const [rr, setRr] = useState("-1");
  const [comment, setComment] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedRr = Number(rr);
    if (!reason.trim() || Number.isNaN(parsedRr)) {
      return;
    }

    onAddSkipped({
      id: crypto.randomUUID(),
      reason: reason.trim(),
      hypotheticalResult: result,
      hypotheticalRr: parsedRr,
      comment: comment.trim(),
    });

    setReason("");
    setResult("lose");
    setRr("-1");
    setComment("");
  };

  return (
    <form className="form" onSubmit={submit}>
      <h3>Добавить пропущенную сделку</h3>
      <label>
        Причина отказа
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Не по правилам стратегии"
          required
        />
      </label>
      <label>
        Гипотетический исход
        <select value={result} onChange={(event) => setResult(event.target.value as TradeResult)}>
          <option value="win">Win</option>
          <option value="lose">Lose</option>
        </select>
      </label>
      <label>
        Гипотетический RR
        <input type="number" step="0.1" value={rr} onChange={(event) => setRr(event.target.value)} required />
      </label>
      <label>
        Комментарий
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={2} />
      </label>
      <button type="submit">Сохранить пропуск</button>
    </form>
  );
};
