import courseAerial from "@/assets/images/course-aerial-bunkers.jpg";

/**
 * Full-bleed ambient course photo with a dark gradient scrim + grain
 * so it blends into the app's near-black background.
 */
export function CoursePhotoBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <img
        src={courseAerial}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: "50% 45%",
          filter: "saturate(0.9) brightness(1.08) contrast(0.98)",
        }}
      />
      <div className="golf-photo-scrim absolute inset-0" />
    </div>
  );
}
