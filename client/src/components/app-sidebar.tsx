import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    Receipt,
    Building2,
    Package,
    Search,
    Shield,
    PackageCheck,
    Menu,
    ChevronDown,
    BarChart3,
    CreditCard,
    Zap,
    FileWarning,
    Repeat,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { NotificationCenter } from "./notification-center";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, Variants } from "framer-motion";
import { isFeatureEnabled } from "@shared/feature-flags";

const menuItems = [
    {
        title: "Home",
        url: "/",
        icon: LayoutDashboard,
        roles: [
            "admin",
            "sales_executive",
            "sales_manager",
            "purchase_operations",
            "finance_accounts",
            "viewer",
        ],
        description: "Dashboard overview",
        featureFlag: 'pages_dashboard' as const,
    },
    {
        title: "Quotes",
        url: "/quotes",
        icon: FileText,
        roles: [
            "admin",
            "sales_executive",
            "sales_manager",
            "finance_accounts",
            "viewer",
        ],
        description: "Manage sales quotes",
        featureFlag: 'pages_quotes' as const,
    },
    {
        title: "Sales Orders",
        url: "/sales-orders",
        icon: Package,
        roles: [
            "admin",
            "sales_executive",
            "sales_manager",
            "finance_accounts",
            "viewer",
        ],
        description: "Manage sales orders",
        featureFlag: 'pages_quotes' as const,
    },
    {
        title: "Clients",
        url: "/clients",
        icon: Users,
        roles: [
            "admin",
            "sales_executive",
            "sales_manager",
            "finance_accounts",
            "viewer",
        ],
        description: "Client management",
        featureFlag: 'pages_clients' as const,
    },
    {
        title: "Invoices",
        url: "/invoices",
        icon: Receipt,
        roles: [
            "admin",
            "sales_executive",
            "sales_manager",
            "finance_accounts",
            "viewer",
        ],
        description: "Invoice tracking",
        featureFlag: 'pages_invoices' as const,
    },
    {
        title: "Subscriptions",
        url: "/subscriptions",
        icon: Repeat,
        roles: [
            "admin",
            "sales_executive",
            "sales_manager",
            "finance_accounts",
            "viewer",
        ],
        description: "Recurring billing",
        featureFlag: 'subscriptions_module' as const,
    },
    {
        title: "Credit Notes",
        url: "/credit-notes",
        icon: CreditCard,
        roles: [
            "admin",
            "finance_accounts",
        ],
        description: "Refunds & returns",
        featureFlag: 'creditNotes_module' as const,
    },
    {
        title: "Debit Notes",
        url: "/debit-notes",
        icon: FileWarning,
        roles: [
            "admin",
            "finance_accounts",
        ],
        description: "Additional charges",
        featureFlag: 'debitNotes_module' as const,
    },
    {
        title: "Vendors",
        url: "/vendors",
        icon: Building2,
        roles: ["admin", "purchase_operations", "viewer"],
        description: "Vendor management",
        featureFlag: 'pages_vendors' as const,
    },
    {
        title: "Vendor POs",
        url: "/vendor-pos",
        icon: PackageCheck,
        roles: ["admin", "purchase_operations", "viewer"],
        description: "Purchase orders",
        featureFlag: 'pages_vendorPOs' as const,
    },
    {
        title: "Products",
        url: "/products",
        icon: Package,
        roles: [
            "admin",
            "purchase_operations",
            "sales_executive",
            "sales_manager",
            "viewer",
        ],
        description: "Product catalog",
        featureFlag: 'pages_products' as const,
    },
    {
        title: "GRN",
        url: "/grn",
        icon: PackageCheck,
        roles: ["admin", "purchase_operations", "viewer"],
        description: "Goods receipt notes",
        featureFlag: 'pages_grn' as const,
    },
    {
        title: "Serial Search",
        url: "/serial-search",
        icon: Search,
        roles: [
            "admin",
            "sales_executive",
            "sales_manager",
            "purchase_operations",
            "viewer",
        ],
        description: "Track serial numbers",
        featureFlag: 'pages_serialSearch' as const,
    },
].filter(item => !item.featureFlag || isFeatureEnabled(item.featureFlag));

const adminItems = [
    {
        title: "User Management",
        url: "/admin/users",
        icon: Users,
        roles: ["admin"],
        description: "Manage users",
        featureFlag: 'pages_adminUsers' as const,
    },
    {
        title: "Workflows",
        url: "/workflows",
        icon: Zap,
        roles: ["admin"],
        description: "Automation workflows",
        featureFlag: 'pages_workflows' as const,
    },
    {
        title: "Governance",
        url: "/admin/governance",
        icon: Shield,
        roles: ["admin"],
        description: "System governance",
        featureFlag: 'pages_governanceDashboard' as const,
    },
    {
        title: "Analytics",
        url: "/admin/analytics",
        icon: BarChart3,
        roles: ["admin", "sales_manager", "finance_accounts"],
        description: "System analytics",
        featureFlag: 'pages_adminAnalytics' as const,
    },
    {
        title: "Configuration",
        url: "/admin/configuration",
        icon: Settings,
        roles: ["admin"],
        description: "System config",
        featureFlag: 'pages_adminConfiguration' as const,
    },
    {
        title: "Advanced Settings",
        url: "/admin/settings",
        icon: Settings,
        roles: ["admin"],
        description: "Advanced options",
        featureFlag: 'pages_adminSettings' as const,
    },
].filter(item => !item.featureFlag || isFeatureEnabled(item.featureFlag));

const springConfig = { type: "spring", stiffness: 400, damping: 30 };

const dropdownVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -4,
        scale: 0.98,
        filter: "blur(2px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            type: "spring",
            bounce: 0,
            duration: 0.2,
        },
    },
};

export function AppSidebar() {
    const { user, logout } = useAuth();
    const [location, setLocation] = useLocation();
    const { toast } = useToast();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [salesDropdownOpen, setSalesDropdownOpen] = useState(false);
    const [purchaseDropdownOpen, setPurchaseDropdownOpen] = useState(false);
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

    const filteredMenuItems = menuItems.filter(
        (item) => user && item.roles.includes(user.role)
    );

    const filteredAdminItems = adminItems.filter(
        (item) => user && item.roles.includes(user.role)
    );

    const isActive = (url: string) =>
        location === url || location.startsWith(url + "/");

    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 10);
    });

    // Grouping logic
    const salesItems = filteredMenuItems.filter((item) =>
        ["Quotes", "Sales Orders", "Clients", "Invoices", "Subscriptions", "Credit Notes", "Debit Notes"].includes(item.title)
    );
    const purchaseItems = filteredMenuItems.filter((item) =>
        ["Vendors", "Vendor POs", "Products", "GRN"].includes(item.title)
    );
    const otherItems = filteredMenuItems.filter((item) =>
        ["Dashboards", "Serial Search"].includes(item.title)
    );
    const homeItem = filteredMenuItems.find((item) => item.title === "Home");

    const handleLogout = async () => {
        try {
            await logout();
            toast({
                title: "Logged out successfully",
            });
        } catch (error: any) {
            toast({
                title: "Logout failed",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
        }
    };

    const [hoveredPath, setHoveredPath] = useState<string | null>(null);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled
                ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800 py-2 shadow-sm"
                : "bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-white/10 dark:border-white/5 py-3"
                }`}
        >
            <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
                <div className="flex items-center justify-between gap-4">
                    {/* LEFT — BRAND */}
                    <button
                        type="button"
                        onClick={() => setLocation("/")}
                        className="flex items-center gap-3 min-w-0 shrink-0 group focus:outline-none"
                    >
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 shadow-lg shadow-indigo-500/20 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img
                                src="/"
                                alt="Company Logo"
                                className="h-5 w-5 object-contain invert brightness-0 saturate-100"
                            />
                        </motion.div>
                        <div className="hidden sm:block min-w-0 text-left">
                            <h2 className="text-base font-bold leading-none tracking-tight text-slate-900 dark:text-white font-display">
                                Company Name
                            </h2>
                            <p className="text-[10px] font-bold tracking-[0.15em] text-slate-900 dark:text-indigo-400 uppercase mt-0.5">
                                QuoteFlow
                            </p>
                        </div>
                    </button>

                    {/* CENTER — DESKTOP NAV */}
                    <div className="hidden flex-1 items-center justify-center lg:flex">
                        <div
                            className="flex items-center gap-1 rounded-full bg-slate-100/50 dark:bg-slate-800/50 px-1.5 py-1.5 border border-slate-200/50 dark:border-white/10 shadow-inner"
                            onMouseLeave={() => setHoveredPath(null)}
                        >
                            {/* Home */}
                            {homeItem && (
                                <NavPill
                                    item={homeItem}
                                    isActive={isActive(homeItem.url)}
                                    hoveredPath={hoveredPath}
                                    setHoveredPath={setHoveredPath}
                                />
                            )}

                            {/* Sales Dropdown */}
                            {salesItems.length > 0 && isFeatureEnabled('nav_salesDropdown') && (
                                <DropdownNav
                                    title="Sales"
                                    icon={FileText}
                                    items={salesItems}
                                    isActive={salesItems.some((item) => isActive(item.url))}
                                    isOpen={salesDropdownOpen}
                                    setIsOpen={setSalesDropdownOpen}
                                    activeCheck={isActive}
                                    hoveredPath={hoveredPath}
                                    setHoveredPath={setHoveredPath}
                                />
                            )}

                            {/* Purchase Dropdown */}
                            {purchaseItems.length > 0 && isFeatureEnabled('nav_purchaseDropdown') && (
                                <DropdownNav
                                    title="Purchase"
                                    icon={Package}
                                    items={purchaseItems}
                                    isActive={purchaseItems.some((item) => isActive(item.url))}
                                    isOpen={purchaseDropdownOpen}
                                    setIsOpen={setPurchaseDropdownOpen}
                                    activeCheck={isActive}
                                    hoveredPath={hoveredPath}
                                    setHoveredPath={setHoveredPath}
                                />
                            )}

                            {/* Other Items */}
                            {otherItems.map((item) => (
                                <NavPill
                                    key={item.title}
                                    item={item}
                                    isActive={isActive(item.url)}
                                    hoveredPath={hoveredPath}
                                    setHoveredPath={setHoveredPath}
                                />
                            ))}

                            {/* Admin Dropdown */}
                            {filteredAdminItems.length > 0 && isFeatureEnabled('nav_adminDropdown') && (
                                <>
                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                                    <DropdownNav
                                        title="Admin"
                                        icon={Shield}
                                        items={filteredAdminItems}
                                        isActive={filteredAdminItems.some((item) => isActive(item.url))}
                                        isOpen={adminDropdownOpen}
                                        setIsOpen={setAdminDropdownOpen}
                                        activeCheck={isActive}
                                        hoveredPath={hoveredPath}
                                        setHoveredPath={setHoveredPath}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT — NOTIFICATIONS, USER, THEME, MOBILE TOGGLE */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <NotificationCenter />
                        {isFeatureEnabled('ui_themeToggle') && <ThemeToggle />}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="hidden md:flex items-center gap-3 pl-1 pr-3 py-1 rounded-full bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/50 dark:border-white/10 transition-all shadow-sm group"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-slate-950 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900/30 transition-all">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                </motion.button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2">
                                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                                    <p className="text-sm font-semibold">{user?.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
                                </div>
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Menu */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="inline-flex items-center justify-center rounded-full lg:hidden h-9 w-9 p-0 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-white/10"
                                >
                                    <Menu className="h-4.5 w-4.5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[360px] overflow-y-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-l border-slate-200/40 dark:border-white/10 p-0">
                                <MobileMenu
                                    user={user}
                                    items={filteredMenuItems}
                                    adminItems={filteredAdminItems}
                                    isActive={isActive}
                                    setLocation={setLocation}
                                    setOpen={setMobileMenuOpen}
                                    handleLogout={handleLogout}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}

// --- Subcomponents ---

function NavPill({ item, isActive, hoveredPath, setHoveredPath }: any) {
    const isHovered = hoveredPath === item.title;

    return (
        <a
            href={item.url}
            onMouseEnter={() => setHoveredPath(item.title)}
            className="relative px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full group select-none"
        >
            {isActive && !hoveredPath && (
                <motion.div
                    layoutId="navbar-pill"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-600"
                    transition={springConfig}
                />
            )}
            {isHovered && (
                <motion.div
                    layoutId="navbar-pill-hover"
                    className="absolute inset-0 bg-slate-200/50 dark:bg-slate-700/50 rounded-full"
                    transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                />
            )}
            <span className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                }`}>
                <span className="hidden xl:inline">{item.title}</span>
                <span className="xl:hidden"><item.icon className="h-4 w-4" /></span>
            </span>
        </a>
    );
}

function DropdownNav({ title, icon: Icon, items, isActive, isOpen, setIsOpen, activeCheck, hoveredPath, setHoveredPath }: any) {
    const isHovered = hoveredPath === title || isOpen;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    onMouseEnter={() => {
                        setIsOpen(true);
                        setHoveredPath(title);
                    }}
                    onMouseLeave={() => setIsOpen(false)}
                    className="relative px-4 py-2 h-auto text-sm font-medium bg-transparent hover:bg-transparent rounded-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-transparent group select-none"
                >
                    {isActive && !isHovered && !hoveredPath && (
                        <motion.div
                            layoutId="navbar-pill"
                            className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-600"
                            transition={springConfig}
                        />
                    )}
                    {isHovered && (
                        <motion.div
                            layoutId="navbar-pill-hover"
                            className="absolute inset-0 bg-slate-200/50 dark:bg-slate-700/50 rounded-full"
                            transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                        />
                    )}
                    <span className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${isActive
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                        }`}>
                        <span className="hidden xl:inline">{title}</span>
                        <span className="xl:hidden"><Icon className="h-4 w-4" /></span>
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} opacity-50 group-hover:opacity-100`} />
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="center"
                sideOffset={10}
                className="w-72 p-2 shadow-xl border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
                onMouseEnter={() => {
                    setIsOpen(true);
                    setHoveredPath(title);
                }}
                onMouseLeave={() => {
                    setIsOpen(false);
                    setHoveredPath(null);
                }}
            >
                <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 -mx-2 -mt-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 flex items-center gap-2">
                        <Icon className="h-3 w-3" />
                        {title}
                    </p>
                </div>
                <div className="space-y-0.5">
                    {items.map((item: any) => (
                        <DropdownMenuItem key={item.title} asChild className="focus:bg-transparent p-0">
                            <a
                                href={item.url}
                                className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 outline-none ${activeCheck(item.url)
                                    ? "bg-indigo-50/80 dark:bg-indigo-900/30"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                    }`}
                            >
                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${activeCheck(item.url)
                                    ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shadow-sm"
                                    }`}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold transition-colors ${activeCheck(item.url)
                                        ? "text-indigo-900 dark:text-indigo-100"
                                        : "text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white"
                                        }`}>
                                        {item.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                        {item.description}
                                    </p>
                                </div>
                            </a>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function MobileMenu({ user, items, adminItems, isActive, setLocation, setOpen, handleLogout }: any) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <img src="/logo.svg" className="h-6 w-6 invert brightness-0 saturate-100" />
                        </div>
                        <span className="font-display font-bold text-lg text-slate-900 dark:text-white">Company name</span>
                    </div>
                    <SheetClose className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="sr-only">Close</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-slate-500"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 18 18" />
                        </svg>
                    </SheetClose>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shadow-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">{user?.role?.replace('_', ' ')}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-hide">
                <div className="space-y-1">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Menu</p>
                    {items.map((item: any) => (
                        <MobileItem
                            key={item.title}
                            item={item}
                            isActive={isActive(item.url)}
                            onClick={() => {
                                setOpen(false);
                                setTimeout(() => setLocation(item.url), 150);
                            }}
                        />
                    ))}
                </div>

                {adminItems.length > 0 && (
                    <div className="space-y-1">
                        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Admin</p>
                        {adminItems.map((item: any) => (
                            <MobileItem
                                key={item.title}
                                item={item}
                                isActive={isActive(item.url)}
                                onClick={() => {
                                    setOpen(false);
                                    setTimeout(() => setLocation(item.url), 150);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all h-12 rounded-xl font-medium"
                    onClick={() => {
                        handleLogout();
                        setOpen(false);
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}

function MobileItem({ item, isActive, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 group active:scale-95 ${isActive
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-indigo-500/10"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
        >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${isActive
                ? "bg-white/20 dark:bg-slate-900/10"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-800"
                }`}>
                <item.icon className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm flex-1 text-left">{item.title}</span>
            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-slate-900" />}
        </button>
    )
}
