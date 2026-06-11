import { IcStar } from "./Icons.jsx";

export default function StarRating({ value, onChange, readOnly = false, size = 22 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={readOnly} onClick={() => onChange?.(n === value ? 0 : n)}
          className={`${readOnly ? "cursor-default" : "hover:scale-110"} transition-transform`}>
          <IcStar width={size} height={size}
            className={n <= (value || 0) ? "text-[#ff9f0a]" : "text-base-content/20"}
            fill={n <= (value || 0) ? "#ff9f0a" : "none"} />
        </button>
      ))}
    </div>
  );
}
