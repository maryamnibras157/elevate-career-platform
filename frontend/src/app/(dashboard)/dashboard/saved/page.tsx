'use client';

import { useEffect, useState } from 'react';
import { CareerService } from '@/services/career.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SortDropdown, SortOption } from '@/components/ui/sort-dropdown';
import { FilterPanel, FilterGroup } from '@/components/ui/filter-panel';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Bookmark, Calendar, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sortOptions: SortOption[] = [
  { id: 'date', label: 'Date Saved', icon: <Calendar className="h-4 w-4" /> },
  { id: 'alpha', label: 'Alphabetical', icon: <SortAsc className="h-4 w-4" /> },
];

export default function SavedCareersPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Data presentation states
  const [sortId, setSortId] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await CareerService.getSavedCareers();
        if (res.success) {
          setSaved(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  // Process data (mock filtering/sorting)
  let displayedData = [...saved];
  
  if (sortId === 'alpha') {
    displayedData.sort((a, b) => {
      const cmp = (a.notes || '').localeCompare(b.notes || '');
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  } else {
    displayedData.sort((a, b) => {
      const cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  const totalPages = Math.ceil(displayedData.length / itemsPerPage);
  const paginatedData = displayedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Careers</h1>
          <p className="text-muted-foreground mt-2">
            Careers you have bookmarked for later review.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <SortDropdown 
            options={sortOptions}
            selectedSort={sortId}
            onSortChange={setSortId}
            sortDirection={sortDirection}
            onDirectionChange={setSortDirection}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : saved.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.map((s, i) => (
              <Card key={i} className="transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>Career ID: {s.career_id.slice(0, 5)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                      <Bookmark className="h-4 w-4 fill-current" />
                    </Button>
                  </CardTitle>
                  <CardDescription>Saved on {new Date(s.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{s.notes || 'No notes added.'}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="py-24">
          <EmptyState 
            icon={Bookmark}
            title="No saved careers"
            description="You haven't bookmarked any careers yet. Start exploring to save your favorites."
            action={{ label: "Explore Careers", onClick: () => {} }}
          />
        </div>
      )}
    </div>
  );
}
