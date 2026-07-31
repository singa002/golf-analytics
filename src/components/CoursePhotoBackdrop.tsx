import courseGreen from "@/assets/course-green.jpg.asset.json";

/**
 * Full-bleed ambient course photo with a dark gradient scrim + grain
 * so it blends into the app's near-black background.
 */
export function CoursePhotoBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <img
        src={courseGreen.url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "50% 72%", filter: "saturate(0.85) brightness(1.05) contrast(0.95)" }}
      />
      <div className="golf-photo-scrim absolute inset-0" />
    </div>
  );
}
