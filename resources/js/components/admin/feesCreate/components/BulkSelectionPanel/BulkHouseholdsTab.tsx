import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Home,
  Users,
  AlertCircle
} from 'lucide-react';
import { Household } from '@/types/fees';

interface BulkHouseholdsTabProps {
  households: Household[];
  selectedIds: (string | number)[];
  filterPurok?: string;
  applyToAll: boolean;
  searchTerm: string;
  toggleSelection: (id: string | number) => void;
  handleSelectAll: () => void;
  setData: (key: string, value: any) => void;
  setSearchTerm: (term: string) => void;
  selectAll: boolean;
}

export default function BulkHouseholdsTab({
  households,
  selectedIds,
  filterPurok,
  applyToAll,
  searchTerm,
  toggleSelection,
  handleSelectAll,
  setData,
  setSearchTerm,
  selectAll,
}: BulkHouseholdsTabProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const selectedCount = applyToAll ? households.length : selectedIds.length;
  const selectedPercentage = households.length > 0 ? Math.round((selectedCount / households.length) * 100) : 0;
  const totalMembers = households.reduce((sum, h) => sum + (h.member_count || 0), 0);

  if (applyToAll) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="bg-primary/10 rounded-full p-4 inline-flex mb-4">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Applying to All Households</h3>
          <p className="text-gray-600 text-sm mb-4">
            This fee will be applied to all {households.length} households
            {filterPurok && ` in Purok ${filterPurok}`}.
          </p>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              Affecting approximately <span className="font-semibold">{totalMembers}</span> residents across all households.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setData('apply_to_all_households', false)}
            size="sm"
          >
            Cancel "Apply to All"
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="border-b p-4 bg-gray-50">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2 text-sm">
                <Search className="h-4 w-4" />
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, contact, or purok..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-purok" className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                Filter by Purok
              </Label>
              <Select
                value={filterPurok || ''}
                onValueChange={(value) => setData('filter_purok', value || '')}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Puroks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Puroks</SelectItem>
                  {Array.from(new Set(households.map(h => h.purok).filter(Boolean))).map((purok) => (
                    <SelectItem key={purok} value={purok!}>
                      Purok {purok}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                View Mode
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={viewMode === 'list' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="h-9 text-xs"
                >
                  {viewMode === 'list' ? 'Grid View' : 'List View'}
                </Button>
              </div>
            </div>
          </div>

          {/* Select All */}
          <div className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="select-all-households"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="select-all-households"
                    className="cursor-pointer font-semibold text-sm"
                  >
                    Select all {households.length} households
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedCount} selected • {selectedPercentage}% coverage • {totalMembers} total members
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setData('filter_purok', '');
                    setSearchTerm('');
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Households List */}
      {households.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No households found</h3>
          <p className="text-gray-500 text-sm text-center max-w-xs">
            {searchTerm || filterPurok
              ? 'Try adjusting your search or filter criteria'
              : 'No households available in the system'}
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          {viewMode === 'list' ? (
            <div className="divide-y">
              {households.map((household) => {
                const isSelected = selectedIds.includes(household.id.toString());
                const isExpanded = expandedItems.has(household.id.toString());

                return (
                  <div
                    key={household.id}
                    className={`p-4 transition-all hover:bg-gray-50 ${
                      isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(household.id)}
                          className="mt-1 h-4 w-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold">{household.name}</div>
                            {household.member_count && (
                              <Badge variant="outline" className="text-xs">
                                <Users className="mr-1 h-3 w-3" />
                                {household.member_count} members
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                            {household.contact_number && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{household.contact_number}</span>
                              </div>
                            )}
                            {household.purok && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span>Purok {household.purok}</span>
                              </div>
                            )}
                            {household.head_of_family && (
                              <div className="col-span-2">
                                <span className="font-medium">Head:</span> {household.head_of_family}
                              </div>
                            )}
                          </div>

                          {isExpanded && household.address && (
                            <div className="mt-3 rounded bg-gray-100 p-3 text-xs">
                              <div className="font-medium mb-1">Complete Address:</div>
                              <div className="text-gray-700">{household.address}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(household.id.toString())}
                          className="h-7 w-7 p-0"
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Grid View
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {households.map((household) => {
                  const isSelected = selectedIds.includes(household.id.toString());

                  return (
                    <div
                      key={household.id}
                      className={`border rounded-lg p-3 transition-all hover:shadow-md cursor-pointer ${
                        isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-gray-200'
                      }`}
                      onClick={() => toggleSelection(household.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(household.id)}
                          className="h-4 w-4"
                        />
                        {household.member_count && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="mr-1 h-3 w-3" />
                            {household.member_count}
                          </Badge>
                        )}
                      </div>
                      <div className="font-semibold text-sm mb-1 truncate">{household.name}</div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {household.contact_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{household.contact_number}</span>
                          </div>
                        )}
                        {household.purok && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>Purok {household.purok}</span>
                          </div>
                        )}
                        {household.head_of_family && (
                          <div className="text-xs">
                            <span className="font-medium">Head:</span> {household.head_of_family}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      )}

      {/* Footer Stats */}
      <div className="border-t p-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{selectedCount}</span> of {households.length} households selected
            <span className="ml-2">
              • ~{Math.round(totalMembers * (selectedCount / Math.max(households.length, 1)))} residents affected
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {selectedPercentage}% coverage
          </div>
        </div>
      </div>
    </div>
  );
}