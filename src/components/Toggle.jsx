export default function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`toggle-switch ${enabled ? 'toggle-switch-enabled' : 'toggle-switch-disabled'}`}
        role="switch"
        aria-checked={enabled}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`toggle-switch-dot ${enabled ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}
