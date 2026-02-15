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
  UserCheck,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Users,
  AlertCircle
} from 'lucide-react';
import { Resident } from '@/types/fees';

interface BulkResidentsTabProps {
  residents: Resident[];
  selectedIds: (string | number)[];
  filterPurok?: string;
  filterDiscountEligible?: boolean;
  applyToAll: boolean;
  searchTerm: string;
  toggleSelection: (id: string | number) => void;
  handleSelectAll: () => void;
  setData: (key: string, value: any) => void;
  setSearchTerm: (term: string) => void;
  selectAll: boolean;
}

export default function BulkResidentsTab({
  residents,
  selectedIds,
  filterPurok,
  filterDiscountEligible,
  applyToAll,
  searchTerm,
  toggleSelection,
  handleSelectAll,
  setData,
  setSearchTerm,
  selectAll,
}: BulkResidentsTabProps) {
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

  const getResidentBadges = (resident: Resident) => {
    const badges = [];
    if (resident.is_senior) badges.push({ label: 'Senior', emoji: '👵', color: 'bg-blue-100 text-blue-800 border-blue-200' });
    if (resident.is_pwd) badges.push({ label: 'PWD', emoji: '♿', color: 'bg-green-100 text-green-800 border-green-200' });
    if (resident.is_solo_parent) badges.push({ label: 'Solo Parent', emoji: '👨‍👧‍👦', color: 'bg-pink-100 text-pink-800 border-pink-200' });
    if (resident.is_indigent) badges.push({ label: 'Indigent', emoji: '🏠', color: 'bg-amber-100 text-amber-800 border-amber-200' });
    return badges;
  };

  const discountEligibleCount = residents.filter(r => 
    r.is_senior || r.is_pwd || r.is_solo_parent || r.is_indigent
  ).length;

  const selectedCount = applyToAll ? residents.length : selectedIds.length;
  const selectedPercentage = residents.length > 0 ? Math.round((selectedCount / residents.length) * 100) : 0;

  if (applyToAll) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="bg-primary/10 rounded-full p-4 inline-flex mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Applying to All Residents</h3>
          <p className="text-gray-600 text-sm mb-4">
            This fee will be applied to all {residents.length} residents
            {filterPurok && ` in Purok ${filterPurok}`}.
          </p>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">{discountEligibleCount}</span> residents are eligible for statutory discounts.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setData('apply_to_all_residents', false)}
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
                  {Array.from(new Set(residents.map(r => r.purok).filter(Boolean))).map((purok) => (
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
                Quick Filters
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={filterDiscountEligible ? "default" : "outline"}
                  size="sm"
                  onClick={() => setData('filter_discount_eligible', !filterDiscountEligible)}
                  className="h-9 text-xs"
                >
                  <UserCheck className="mr-2 h-3 w-3" />
                  Discount Eligible Only
                </Button>
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
                  id="select-all-residents"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="select-all-residents"
                    className="cursor-pointer font-semibold text-sm"
                  >
                    Select all {residents.length} residents
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedCount} selected • {selectedPercentage}% coverage
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
                    setData('filter_discount_eligible', false);
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

      {/* Residents List */}
      {residents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No residents found</h3>
          <p className="text-gray-500 text-sm text-center max-w-xs">
            {searchTerm || filterPurok || filterDiscountEligible
              ? 'Try adjusting your search or filter criteria'
              : 'No residents available in the system'}
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          {viewMode === 'list' ? (
            <div className="divide-y">
              {residents.map((resident) => {
                const isSelected = selectedIds.includes(resident.id.toString());
                const badges = getResidentBadges(resident);
                const isExpanded = expandedItems.has(resident.id.toString());

                return (
                  <div
                    key={resident.id}
                    className={`p-4 transition-all hover:bg-gray-50 ${
                      isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(resident.id)}
                          className="mt-1 h-4 w-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold truncate">
                              {resident.full_name}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {badges.map((badge, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline"
                                  className={`text-xs px-2 py-0.5 ${badge.color}`}
                                >
                                  <span className="mr-1 text-xs">{badge.emoji}</span>
                                  <span className="text-xs">{badge.label}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                            {resident.contact_number && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{resident.contact_number}</span>
                              </div>
                            )}
                            {resident.purok && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span>Purok {resident.purok}</span>
                              </div>
                            )}
                            {resident.age && (
                              <div>
                                <span className="font-medium">Age:</span> {resident.age}
                              </div>
                            )}
                            {resident.gender && (
                              <div>
                                <span className="font-medium">Gender:</span> {resident.gender}
                              </div>
                            )}
                          </div>

                          {isExpanded && resident.address && (
                            <div className="mt-3 rounded bg-gray-100 p-3 text-xs">
                              <div className="font-medium mb-1">Complete Address:</div>
                              <div className="text-gray-700">{resident.address}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(resident.id.toString())}
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
                {residents.map((resident) => {
                  const isSelected = selectedIds.includes(resident.id.toString());
                  const badges = getResidentBadges(resident);

                  return (
                    <div
                      key={resident.id}
                      className={`border rounded-lg p-3 transition-all hover:shadow-md cursor-pointer ${
                        isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-gray-200'
                      }`}
                      onClick={() => toggleSelection(resident.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(resident.id)}
                          className="h-4 w-4"
                        />
                        <div className="flex flex-wrap gap-1">
                          {badges.slice(0, 2).map((badge, idx) => (
                            <Badge 
                              key={idx} 
                              className={`text-xs px-1.5 py-0.5 ${badge.color}`}
                            >
                              <span className="text-xs">{badge.emoji}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="font-semibold text-sm mb-1 truncate">{resident.full_name}</div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {resident.contact_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{resident.contact_number}</span>
                          </div>
                        )}
                        {resident.purok && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>Purok {resident.purok}</span>
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
            <span className="font-medium">{selectedCount}</span> of {residents.length} residents selected
            {discountEligibleCount > 0 && (
              <span className="ml-2 text-blue-600">
                • {discountEligibleCount} discount eligible
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {selectedPercentage}% coverage
          </div>
        </div>
      </div>
    </div>
  );
}