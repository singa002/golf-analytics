import courseAerial from "@/assets/images/course-aerial-bunkers.jpg";
import dashboardMountains from "@/assets/images/dan-congdon-gJeusCuFyYA-unsplash.jpg";
import analyticsBallHole from "@/assets/images/soheb-zaidi-awin-9RBlpE-unsplash.jpg";
import practiceBallPutter from "@/assets/images/peter-drew-9idjx1KAyTU-unsplash.jpg";

export type CoursePhotoVariant = "default" | "dashboard" | "analytics" | "practice";

type VariantConfig = {
  src: string;
  objectPosition: string;
  /** Image filter — desaturate/darken enough for white text on glass */
  filter: string;
  scrimClass: string;
};

const VARIANTS: Record<CoursePhotoVariant, VariantConfig> = {
  // Compete / Settings — existing aerial bunkers treatment
  default: {
    src: courseAerial,
    objectPosition: "50% 45%",
    filter: "saturate(0.9) brightness(1.08) contrast(0.98)",
    scrimClass: "golf-photo-scrim",
  },
  // Wide landscape: green + mountains — slight darkening so glass text stays crisp
  dashboard: {
    src: dashboardMountains,
    objectPosition: "50% 42%",
    filter: "saturate(0.85) brightness(0.9) contrast(1.01)",
    scrimClass: "golf-photo-scrim-dashboard",
  },
  // Golden-hour ball at hole — hot highlight at top; heavier top + edge darkening
  analytics: {
    src: analyticsBallHole,
    objectPosition: "48% 58%",
    filter: "saturate(0.72) brightness(0.62) contrast(1.05)",
    scrimClass: "golf-photo-scrim-analytics",
  },
  // Ball + putter close-up — bright upper wash; protect left-column UI readability
  practice: {
    src: practiceBallPutter,
    objectPosition: "35% 55%",
    filter: "saturate(0.88) brightness(0.95) contrast(1.0)",
    scrimClass: "golf-photo-scrim-practice",
  },
};

const VARIANT_ORDER: CoursePhotoVariant[] = ["dashboard", "analytics", "practice", "default"];

/** Bundled photo URLs — used for `<link rel="preload">` so navigations never wait on fetch. */
export const COURSE_PHOTO_PRELOAD_HREFS: string[] = VARIANT_ORDER.map((key) => VARIANTS[key].src);

/** Map golfer routes → backdrop variant. */
export function coursePhotoVariantFromPath(pathname: string): CoursePhotoVariant {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/practice")) return "practice";
  if (pathname.startsWith("/analytics")) return "analytics";
  return "default";
}

/**
 * Persistent full-bleed course photo for the authenticated shell.
 * All variants stay mounted; opacity crossfades on route change so nothing
 * unmounts into the near-black page background between screens.
 */
export function CoursePhotoBackdrop({ variant = "default" }: { variant?: CoursePhotoVariant }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {VARIANT_ORDER.map((key) => {
        const config = VARIANTS[key];
        const active = key === variant;
        return (
          <div
            key={key}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{ opacity: active ? 1 : 0 }}
          >
            <img
              src={config.src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: config.objectPosition,
                filter: config.filter,
              }}
              // Eager decode so inactive layers are ready before first crossfade.
              loading="eager"
              decoding="async"
            />
            <div className={`${config.scrimClass} absolute inset-0`} />
          </div>
        );
      })}
    </div>
  );
}
