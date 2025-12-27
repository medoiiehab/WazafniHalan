import { Link } from 'react-router-dom';
import { MapPin, Building2, Star } from 'lucide-react';
import { Job, exclusiveTagLabels } from '@/types/database';

interface JobCardProps {
  job: Job;
}

// Placeholder work images
const placeholderImages = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=400&fit=crop',
];

const getJobImage = (job: Job) => {
  if (job.image_url) return job.image_url;
  const index = job.id.charCodeAt(0) % placeholderImages.length;
  return placeholderImages[index];
};

const JobCard = ({ job }: JobCardProps) => {
  const imageUrl = getJobImage(job);

  return (
    <Link to={`/job/${job.id}`} className="block group">
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 aspect-square flex flex-col">
        {/* Job Image */}
        <div className="w-full h-1/2 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={job.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {job.is_featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Star className="w-3 h-3 fill-current" />
                مميز
              </span>
            )}
            {job.exclusive_tag && job.exclusive_tag !== 'none' && (
              <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                {exclusiveTagLabels[job.exclusive_tag]}
              </span>
            )}
            <span className="country-badge text-xs">
              {job.country}
            </span>
          </div>
          
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {job.title}
          </h3>
          
          <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-auto">
            {job.company && (
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{job.company}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {job.country}
            </span>
          </div>
          
          {job.salary && (
            <p className="text-sm font-semibold text-primary mt-2 truncate">
              {job.salary}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
