/**
 * The single icon source for AddisDispatch.
 *
 * Every icon in the platform comes from Tabler Icons, wrapped here so the whole
 * app shares ONE consistent stroke width and one semantic mapping — the same
 * icon always means the same thing (Truck = carrier, Package = load, …). Import
 * the semantic names below; do not hand-roll inline <svg> icons or use emoji.
 *
 * Size scale (pass `size=`): 16 (inline / dense), 20 (nav, buttons), 24
 * (page headers, empty states, KPI tiles).
 */
import {
  // — brand / domain —
  IconTruck,
  IconPackage,
  IconMapPin,
  IconRoute,
  IconBuildingWarehouse,
  IconBuilding,
  IconShieldCheck,
  IconFileText,
  IconFileInvoice,
  IconReceipt2,
  IconCreditCard,
  IconWallet,
  IconCurrencyDollar,
  IconChartBar,
  IconReportAnalytics,
  IconGauge,
  IconTrendingUp,
  IconClock,
  IconSnowflake,
  IconBolt,
  IconStack2,
  IconBox,
  IconRepeat,
  IconStar,
  // — people —
  IconUser,
  IconUsers,
  IconUserPlus,
  IconUserCheck,
  // — actions / ui —
  IconBell,
  IconSettings,
  IconSearch,
  IconMenu2,
  IconX,
  IconCheck,
  IconPlus,
  IconMinus,
  IconArrowRight,
  IconArrowLeft,
  IconArrowUp,
  IconChevronDown,
  IconDots,
  IconFilter,
  IconDownload,
  IconUpload,
  IconEye,
  IconPencil,
  IconTrash,
  IconSend,
  IconMessageCircle,
  IconPaperclip,
  IconPhone,
  IconMail,
  IconShare,
  IconLink,
  IconLogout,
  IconSun,
  IconMoon,
  IconMap2,
  IconChecklist,
  IconLayoutGrid,
  IconCircleCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconClipboardCheck,
  IconCalendar,
  IconSparkles,
  IconLifebuoy,
  IconCopy,
} from "@tabler/icons-react";

type TablerIcon = typeof IconTruck;
export type IconProps = React.ComponentProps<TablerIcon>;

/** Apply the platform-wide default stroke to a Tabler icon (props still override). */
function wrap(Cmp: TablerIcon, name: string) {
  const Wrapped = (props: IconProps) => <Cmp stroke={1.75} {...props} />;
  Wrapped.displayName = name;
  return Wrapped;
}

// — Canonical semantic set (use these everywhere) —
export const Truck = wrap(IconTruck, "Truck"); // carriers
export const Package = wrap(IconPackage, "Package"); // loads / shipments
export const MapPin = wrap(IconMapPin, "MapPin"); // locations / lanes
export const Route = wrap(IconRoute, "Route");
export const Warehouse = wrap(IconBuildingWarehouse, "Warehouse");
export const Building = wrap(IconBuilding, "Building"); // brokers
export const ShieldCheck = wrap(IconShieldCheck, "ShieldCheck"); // compliance / authority
export const FileText = wrap(IconFileText, "FileText"); // documents
export const FileInvoice = wrap(IconFileInvoice, "FileInvoice"); // invoices
export const Receipt = wrap(IconReceipt2, "Receipt"); // settlements
export const CreditCard = wrap(IconCreditCard, "CreditCard"); // payments
export const Wallet = wrap(IconWallet, "Wallet"); // pay
export const Dollar = wrap(IconCurrencyDollar, "Dollar");
export const ChartBar = wrap(IconChartBar, "ChartBar"); // analytics
export const ReportAnalytics = wrap(IconReportAnalytics, "ReportAnalytics");
export const Gauge = wrap(IconGauge, "Gauge");
export const TrendingUp = wrap(IconTrendingUp, "TrendingUp");
export const Clock = wrap(IconClock, "Clock");
export const Users = wrap(IconUsers, "Users"); // contacts / accounts
export const User = wrap(IconUser, "User");
export const Share = wrap(IconShare, "Share");
export const UserPlus = wrap(IconUserPlus, "UserPlus"); // applications
export const UserCheck = wrap(IconUserCheck, "UserCheck"); // approvals
export const Bell = wrap(IconBell, "Bell"); // notifications
export const Settings = wrap(IconSettings, "Settings"); // configuration
export const Search = wrap(IconSearch, "Search");
export const Menu = wrap(IconMenu2, "Menu");
export const X = wrap(IconX, "X"); // close
export const Check = wrap(IconCheck, "Check");
export const CircleCheck = wrap(IconCircleCheck, "CircleCheck");
export const AlertTriangle = wrap(IconAlertTriangle, "AlertTriangle");
export const InfoCircle = wrap(IconInfoCircle, "InfoCircle");
export const LifeBuoy = wrap(IconLifebuoy, "LifeBuoy"); // help / support
export const Copy = wrap(IconCopy, "Copy");
export const Plus = wrap(IconPlus, "Plus");
export const Minus = wrap(IconMinus, "Minus");
export const ArrowRight = wrap(IconArrowRight, "ArrowRight");
export const ArrowLeft = wrap(IconArrowLeft, "ArrowLeft");
export const ArrowUp = wrap(IconArrowUp, "ArrowUp");
export const ChevronDown = wrap(IconChevronDown, "ChevronDown");
export const Dots = wrap(IconDots, "Dots"); // overflow menu (…)
export const Filter = wrap(IconFilter, "Filter");
export const Download = wrap(IconDownload, "Download");
export const Upload = wrap(IconUpload, "Upload");
export const Eye = wrap(IconEye, "Eye"); // view
export const Pencil = wrap(IconPencil, "Pencil"); // edit
export const Trash = wrap(IconTrash, "Trash"); // delete
export const Send = wrap(IconSend, "Send");
export const MessageCircle = wrap(IconMessageCircle, "MessageCircle"); // chat / messages
export const Paperclip = wrap(IconPaperclip, "Paperclip"); // attachment
export const Phone = wrap(IconPhone, "Phone");
export const Mail = wrap(IconMail, "Mail"); // inbox / email
export const Logout = wrap(IconLogout, "Logout");
export const Sun = wrap(IconSun, "Sun");
export const Moon = wrap(IconMoon, "Moon");
export const LayoutGrid = wrap(IconLayoutGrid, "LayoutGrid"); // dashboard
export const Checklist = wrap(IconChecklist, "Checklist");
export const ClipboardCheck = wrap(IconClipboardCheck, "ClipboardCheck"); // POD review
export const Calendar = wrap(IconCalendar, "Calendar");
export const Sparkles = wrap(IconSparkles, "Sparkles"); // AI assistant
export const Star = wrap(IconStar, "Star");

// — Backward-compatible aliases (kept so existing imports render Tabler icons) —
export const RouteIcon = Route;
export const ClockIcon = Clock;
export const GaugeIcon = Gauge;
export const ReportIcon = ReportAnalytics;
export const TruckIcon = Truck;
export const LinkIcon = wrap(IconLink, "LinkIcon");
export const InvoiceIcon = FileInvoice;
export const ChartIcon = ChartBar;
export const MenuIcon = Menu;
export const CloseIcon = X;
export const CheckIcon = Check;
export const DollarIcon = Dollar;
export const MapIcon = wrap(IconMap2, "MapIcon");
export const UserIcon = User;
export const UsersIcon = Users;
export const ShareIcon = Share;
export const TrendingUpIcon = TrendingUp;
export const RepeatIcon = wrap(IconRepeat, "RepeatIcon");
export const StarIcon = wrap(IconStar, "StarIcon");
export const BoxIcon = wrap(IconBox, "BoxIcon");
export const LayersIcon = wrap(IconStack2, "LayersIcon");
export const SnowflakeIcon = wrap(IconSnowflake, "SnowflakeIcon");
export const ZapIcon = wrap(IconBolt, "ZapIcon");
export const ArrowUpIcon = ArrowUp;
