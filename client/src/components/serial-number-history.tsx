import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, FileText, Store, ShieldCheck, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

interface SerialNumberHistoryProps {
  serialNumber: string;
}

interface SerialNumberDetail {
  id: string;
  serialNumber: string;
  status: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  vendor?: {
    id: string;
    name: string;
  };
  vendorPo?: {
    id: string;
    poNumber: string;
    orderDate: string;
  };
  grn?: {
    id: string;
    grnNumber: string;
    receivedDate: string;
    inspectionStatus: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    createdAt: string;
  };
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SerialNumberHistory({ serialNumber }: SerialNumberHistoryProps) {
  const { data: serial, isLoading } = useQuery<SerialNumberDetail>({
    queryKey: ["/api/serial-numbers", serialNumber],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!serial) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Serial number not found</h3>
          <p className="text-muted-foreground">
            The serial number "{serialNumber}" could not be found in the system.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: string }> = {
      in_stock: { label: "In Stock", variant: "default" },
      reserved: { label: "Reserved", variant: "warning" },
      delivered: { label: "Delivered", variant: "success" },
      returned: { label: "Returned", variant: "destructive" },
      defective: { label: "Defective", variant: "destructive" },
    };

    const config = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const isWarrantyActive = () => {
    if (!serial.warrantyStartDate || !serial.warrantyEndDate) return false;
    const now = new Date();
    const start = new Date(serial.warrantyStartDate);
    const end = new Date(serial.warrantyEndDate);
    return now >= start && now <= end;
  };

  const timelineEvents = [
    serial.vendor && {
      icon: Store,
      title: "Ordered from Vendor",
      description: serial.vendor.name,
      date: serial.vendorPo?.orderDate,
      meta: serial.vendorPo?.poNumber,
    },
    serial.grn && {
      icon: Truck,
      title: "Goods Received",
      description: `Inspection: ${serial.grn.inspectionStatus}`,
      date: serial.grn.receivedDate,
      meta: serial.grn.grnNumber,
    },
    serial.invoice && {
      icon: FileText,
      title: "Invoiced to Customer",
      description: "Added to invoice",
      date: serial.invoice.createdAt,
      meta: serial.invoice.invoiceNumber,
    },
    serial.warrantyStartDate && {
      icon: ShieldCheck,
      title: "Warranty Activated",
      description: `Valid until ${format(new Date(serial.warrantyEndDate!), "PPP")}`,
      date: serial.warrantyStartDate,
      meta: isWarrantyActive() ? "Active" : "Expired",
    },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-mono">{serial.serialNumber}</CardTitle>
            {getStatusBadge(serial.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {serial.product && (
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-semibold">{serial.product.name}</div>
                <div className="text-sm text-muted-foreground">SKU: {serial.product.sku}</div>
              </div>
            </div>
          )}

          {serial.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Current Location</div>
                <div className="font-semibold">{serial.location}</div>
              </div>
            </div>
          )}

          {serial.notes && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Notes</div>
              <div className="text-sm">{serial.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warranty Card */}
      {serial.warrantyStartDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Warranty Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Start Date</div>
                <div className="font-semibold">
                  {format(new Date(serial.warrantyStartDate), "PPP")}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">End Date</div>
                <div className="font-semibold">
                  {format(new Date(serial.warrantyEndDate!), "PPP")}
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={isWarrantyActive() ? "default" : "outline"}>
                {isWarrantyActive() ? "Active" : "Expired"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lifecycle Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timelineEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No lifecycle events recorded yet
              </p>
            ) : (
              timelineEvents.map((event: any, index) => {
                const Icon = event.icon;
                const isLast = index === timelineEvents.length - 1;

                return (
                  <div key={index} className="relative">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        {/* Connector line */}
                        {!isLast && (
                          <div className="absolute left-5 top-10 bottom-0 w-px bg-border h-6" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-semibold">{event.title}</div>
                          {event.date && (
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(event.date), "MMM d, yyyy")}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                        {event.meta && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {event.meta}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{format(new Date(serial.createdAt), "PPp")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span>{format(new Date(serial.updatedAt), "PPp")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Serial ID</span>
            <span className="font-mono text-xs">{serial.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

