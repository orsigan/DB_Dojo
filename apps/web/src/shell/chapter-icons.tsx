import type { ReactNode, SVGProps } from 'react';
import type { GraphNodeKind } from '../app/graph/model';

function iconProps(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props
  };
}

function DatabaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </svg>
  );
}

function TableIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M3 15h18M9.5 4v16" />
    </svg>
  );
}

function LayersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}

function BoltIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
    </svg>
  );
}

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M14.7 14.2c2.4.4 4.3 2.5 4.3 5.8" />
    </svg>
  );
}

function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <path d="M12 6c-2-1.5-5-2-8-1v13c3-1 6-.5 8 1 2-1.5 5-2 8-1V5c-3-1-6-.5-8 1Z" />
      <path d="M12 6v13" />
    </svg>
  );
}

function FolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.6.8l1 1.2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

function ChallengeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7.5 10 2.5 2-2.5 2M12.5 14h4" />
    </svg>
  );
}

function SchemaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <rect x="3" y="4" width="8" height="7" rx="1.5" />
      <rect x="13" y="4" width="8" height="7" rx="1.5" />
      <rect x="8" y="14" width="8" height="7" rx="1.5" />
      <path d="M7 11v2h10v-2M12 14v-1.5" />
    </svg>
  );
}

function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <path d="m4 20 1-5L16 4l4 4L9 19l-5 1Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.8-4.8" />
    </svg>
  );
}

function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <rect x="4.5" y="11" width="15" height="10" rx="2" />
      <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" />
    </svg>
  );
}

function NetworkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <circle cx="12" cy="4.5" r="2.2" />
      <circle cx="5" cy="19" r="2.2" />
      <circle cx="19" cy="19" r="2.2" />
      <path d="M12 6.7 6.3 17M12 6.7 17.7 17M7.2 19h9.6" />
    </svg>
  );
}

function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TerminalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9.5 3 2.5-3 2.5M12.5 14.5h4.5" />
    </svg>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <path d="M12 3.5 5 6v6c0 4.4 3 7.2 7 8.5 4-1.3 7-4.1 7-8.5V6l-7-2.5Z" />
      <path d="m9.3 12 1.9 1.9L15 10" />
    </svg>
  );
}

export function FlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)} aria-hidden="true">
      <path d="M5 21V4" />
      <path d="M5 4h13l-3 4.5L18 13H5" />
    </svg>
  );
}

const CHAPTER_ICONS: Record<string, (props: SVGProps<SVGSVGElement>) => ReactNode> = {
  fundamentals: DatabaseIcon,
  'sql-uml': TableIcon,
  'database-data-structures': LayersIcon,
  'application-automation': BoltIcon,
  'concurrency-multi-user': UsersIcon,
  'sql-uml-ddl': SchemaIcon,
  'sql-uml-dml': PencilIcon,
  'sql-uml-queries': SearchIcon,
  'sql-uml-permissions': LockIcon,
  'sql-uml-er-modeling': NetworkIcon,
  'application-automation-views': EyeIcon,
  'application-automation-plpgsql': TerminalIcon,
  'application-automation-triggers': ShieldIcon
};

export function ChapterIcon({
  chapterId,
  ...props
}: { chapterId: string } & SVGProps<SVGSVGElement>) {
  const Icon = CHAPTER_ICONS[chapterId] ?? BookIcon;
  return <Icon {...props} />;
}

const KIND_ICONS: Record<GraphNodeKind, (props: SVGProps<SVGSVGElement>) => ReactNode> = {
  chapter: BookIcon,
  folder: FolderIcon,
  exercise: ChallengeIcon
};

export function GraphNodeIcon({
  kind,
  iconKey,
  ...props
}: { kind: GraphNodeKind; iconKey?: string } & SVGProps<SVGSVGElement>) {
  const Icon = (iconKey ? CHAPTER_ICONS[iconKey] : undefined) ?? KIND_ICONS[kind] ?? BookIcon;
  return <Icon {...props} />;
}
