import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, MapPin, Building2 } from 'lucide-react';
import { Job } from '@/types/database';

interface FeaturedJobsSliderProps {
  jobs: Job[];
}

// Placeholder work images
const placeholderImages = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=200&fit=crop',
];

const getJobImage = (job: Job) => {
  if (job.image_url) return job.image_url;
  const index = job.id.charCodeAt(0) % placeholderImages.length;
  return placeholderImages[index];
};

const FeaturedJobsSlider = ({ jobs }: FeaturedJobsSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 320;
      sliderRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (jobs.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-accent transition-colors mr-5"
        aria-label="السابق"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-accent transition-colors ml-5"
        aria-label="التالي"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {jobs.map((job) => (
          <Link
            key={job.id}
            to={`/job/${job.id}`}
            className="flex-shrink-0 w-[300px] bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border group overflow-hidden"
          >
            {/* Job Image */}
            <div className="w-full h-32 overflow-hidden">
              <img
                src={getJobImage(job)}
                alt={job.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  مميز
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                {job.title}
              </h3>

              <div className="flex flex-col gap-1 text-sm text-foreground font-medium mb-2">
                {job.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {job.company}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.country}
                </span>
              </div>

              {job.salary && (
                <p className="text-sm font-semibold text-primary">
                  {job.salary}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedJobsSlider;
