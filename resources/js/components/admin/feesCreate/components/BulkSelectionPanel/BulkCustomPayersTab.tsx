import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User,
  Phone,
  MapPin,
  Home,
  Trash2,
  Plus,
  Upload,
  AlertCircle
} from 'lucide-react';

interface CustomPayer {
  id: string;
  name: string;
  contact_number?: string;
  purok?: string;
  address?: string;
  type: 'custom';
}

interface BulkCustomPayersTabProps {
  customPayers: CustomPayer[];
  puroks: string[];
  addCustomPayer: () => void;
  removeCustomPayer: (id: string) => void;
  updateCustomPayer: (id: string, field: string, value: string) => void;
}

export default function BulkCustomPayersTab({
  customPayers,
  puroks,
  addCustomPayer,
  removeCustomPayer,
  updateCustomPayer,
}: BulkCustomPayersTabProps) {
  const handleImportCSV = () => {
    // CSV import logic would go here
    console.log('Import CSV functionality');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Custom Payers</h3>
            <p className="text-sm text-gray-500">
              Add payers not in the resident or household database
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleImportCSV}
              className="gap-1 text-xs"
            >
              <Upload className="h-3 w-3" />
              Import CSV
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={addCustomPayer}
              className="gap-1 text-xs"
            >
              <Plus className="h-3 w-3" />
              Add Payer
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {customPayers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center max-w-md">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                No custom payers added yet
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Add custom payers manually or import from CSV. Each payer will receive a separate fee invoice.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={handleImportCSV} size="sm">
                  <Upload className="mr-1 h-3 w-3" />
                  Import CSV
                </Button>
                <Button onClick={addCustomPayer} size="sm">
                  <Plus className="mr-1 h-3 w-3" />
                  Add First Payer
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="space-y-3">
                {customPayers.map((payer) => (
                  <div key={payer.id} className="rounded-lg border bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold">Custom Payer</span>
                        <Badge variant="outline" className="text-xs">
                          External
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomPayer(payer.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${payer.id}`} className="text-xs font-medium">
                          Full Name *
                        </Label>
                        <Input
                          id={`name-${payer.id}`}
                          value={payer.name}
                          onChange={(e) => 
                            updateCustomPayer(payer.id, 'name', e.target.value)
                          }
                          placeholder="Juan Dela Cruz"
                          required
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`contact-${payer.id}`} className="text-xs font-medium">
                          Contact Number
                        </Label>
                        <Input
                          id={`contact-${payer.id}`}
                          value={payer.contact_number || ''}
                          onChange={(e) => 
                            updateCustomPayer(payer.id, 'contact_number', e.target.value)
                          }
                          placeholder="09123456789"
                          type="tel"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`purok-${payer.id}`} className="text-xs font-medium">
                          Purok
                        </Label>
                        <Select
                          value={payer.purok || ''}
                          onValueChange={(value) => 
                            updateCustomPayer(payer.id, 'purok', value)
                          }
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select Purok" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Purok</SelectItem>
                            {puroks.map((purok) => (
                              <SelectItem key={purok} value={purok}>
                                Purok {purok}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`address-${payer.id}`} className="text-xs font-medium">
                          Complete Address
                        </Label>
                        <Input
                          id={`address-${payer.id}`}
                          value={payer.address || ''}
                          onChange={(e) => 
                            updateCustomPayer(payer.id, 'address', e.target.value)
                          }
                          placeholder="Street, Barangay, City"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <AlertCircle className="h-3 w-3" />
                        This payer will receive a separate fee invoice.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer */}
      {customPayers.length > 0 && (
        <div className="border-t p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{customPayers.length}</span> custom payers added
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={addCustomPayer}
                size="sm"
                className="text-xs"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Another Payer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleImportCSV}
                size="sm"
                className="text-xs"
              >
                <Upload className="mr-1 h-3 w-3" />
                Import More
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}