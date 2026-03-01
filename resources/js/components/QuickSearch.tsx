import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Home, Briefcase, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface QuickSearchResult {
  id: number;
  type: string;
  text: string;
  subtext?: string;
  url: string;
  icon: string;
}

interface PageProps {
  quickResults?: QuickSearchResult[];
  [key: string]: any;
}

const iconMap: Record<string, React.ElementType> = {
  User,
  Home,
  Briefcase,
  Search,
};

export function QuickSearch() {
  const { props } = usePage<PageProps>();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QuickSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && event.target instanceof Node && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for quick results from the server (shared via middleware)
  useEffect(() => {
    if (props.quickResults) {
      setResults(props.quickResults);
      setLoading(false);
      if (props.quickResults.length > 0 || query.length >= 2) {
        setIsOpen(true);
      }
    }
  }, [props.quickResults, query.length]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.length >= 2) {
        setLoading(true);
        
        // Make a PARTIAL RELOAD request that ONLY updates the quickResults prop
        // This WILL NOT reload the entire page, only fetch new data
        router.reload({
          data: { 
            q: query, 
            quick: true 
          },
          only: ['quickResults'],
          onError: (errors) => {
            console.error('Search error:', errors);
            setLoading(false);
          },
          onSuccess: () => {
            // Results will be updated via the props effect above
          }
        });
      } else {
        setResults([]);
        setIsOpen(false);
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleResultClick = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.visit(url);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    if (query.trim()) {
      router.visit(route('search', { q: query }));
      setQuery('');
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Search;
    return <Icon className="h-4 w-4" />;
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Quick search..."
          className="pl-10 pr-10 py-2 w-64"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover rounded-md border shadow-lg overflow-hidden z-50">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result.url)}
                    className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                      {getIcon(result.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.text}</p>
                      {result.subtext && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtext}
                        </p>
                      )}
                    </div>
                    <span className="text-xs capitalize text-muted-foreground">
                      {result.type}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t px-4 py-2 bg-muted/50">
                <button
                  onClick={handleViewAll}
                  className="text-sm text-primary hover:underline w-full text-left font-medium"
                >
                  View all results for "{query}" →
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p>No results found</p>
              <button
                onClick={handleViewAll}
                className="text-sm text-primary hover:underline mt-2 font-medium"
              >
                Search for "{query}" instead →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}