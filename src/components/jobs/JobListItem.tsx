import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Briefcase, Calendar, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { MatchScoreBadge } from "./MatchScoreBadge";

interface JobItemProps {
  job: Record<string, unknown>;
  isExpanded: boolean;
  onToggle: () => void;
  onApply: () => void;
  isSaved?: boolean;
  onSave?: () => void;
}

export function JobListItem({
  job,
  isExpanded,
  onToggle,
  onApply,
  isSaved,
  onSave,
}: JobItemProps) {
  const [fullDescription, setFullDescription] = useState<string>("");
  const [loadingDescription, setLoadingDescription] = useState(false);

  // Truncate description to preview (first 150 characters)
  const getPreviewDescription = () => {
    const desc = String(job.description || "");
    if (desc.length > 150) {
      return desc.substring(0, 150) + "...";
    }
    return desc;
  };

  // Load full description when expanded
  useEffect(() => {
    if (isExpanded && !fullDescription && job.description) {
      setLoadingDescription(true);
      // Simulate lazy loading delay
      setTimeout(() => {
        setFullDescription(String(job.description || ""));
        setLoadingDescription(false);
      }, 300);
    }
  }, [isExpanded, fullDescription, job.description]);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Job Title */}
            <h3 className="text-lg font-semibold line-clamp-2 text-gray-900">
              {job.title}
            </h3>

            {/* Company */}
            {job.company && (
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.company}
              </p>
            )}
          </div>

          {/* Match Score Badge + Action Buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <MatchScoreBadge jobId={Number(job.id)} />
            <div className="flex gap-2">
              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  className={cn(isSaved && "bg-yellow-50 border-yellow-300")}
                >
                  {isSaved ? "✓" : "★"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                className="w-10 h-10 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Job Details Row */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
          )}
          {job.type && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {job.type}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {job.salary}
            </span>
          )}
          {job.created_at && (
            <span className="text-xs text-gray-500">
              Publié il y a{" "}
              {Math.floor(
                (Date.now() - new Date(String(job.created_at)).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              jours
            </span>
          )}
        </div>

        {/* Tags */}
        {job.sector && (
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{job.sector}</Badge>
            {job.competence && (
              <Badge variant="outline">{String(job.competence)}</Badge>
            )}
          </div>
        )}

        {/* Description Preview / Full */}
        <div>
          <p className="text-sm text-gray-700">
            {isExpanded ? fullDescription : getPreviewDescription()}
          </p>
          {isExpanded && loadingDescription && (
            <p className="text-xs text-gray-400 mt-2">Chargement...</p>
          )}
        </div>

        {/* Action Buttons */}
        {isExpanded && (
          <div className="flex gap-2 pt-2">
            <Button onClick={onApply} className="flex-1" size="sm">
              Postuler
            </Button>
            <Button
              variant="outline"
              onClick={onToggle}
              size="sm"
              className="flex-1"
            >
              Fermer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
