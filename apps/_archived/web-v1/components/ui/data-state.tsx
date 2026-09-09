import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  SearchX,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type DataStateVariant =
  | 'loading'
  | 'empty'
  | 'error'
  | 'forbidden'
  | 'success';

const stateIcons: Record<DataStateVariant, LucideIcon> = {
  loading: LoaderCircle,
  empty: SearchX,
  error: AlertTriangle,
  forbidden: LockKeyhole,
  success: CheckCircle2,
};

export function DataState({
  variant,
  title,
  description,
  action,
  compact = false,
}: {
  variant: DataStateVariant;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  const Icon = stateIcons[variant];
  return (
    <div
      className={`data-state data-state-${variant} ${compact ? 'data-state-compact' : ''}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'loading' ? 'polite' : undefined}
    >
      <span>
        <Icon />
      </span>
      <div>
        <b>{title}</b>
        <p>{description}</p>
      </div>
      {action ? <div className="data-state-action">{action}</div> : null}
    </div>
  );
}
