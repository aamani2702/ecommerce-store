// Grey shimmering placeholders shown while data is loading

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="skeleton aspect-[3/4]" />
      <div className="p-4 space-y-2 flex flex-col items-center">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-4 w-1/4" />
      </div>
    </div>
  );
}

export function SkeletonTile() {
  return <div className="skeleton aspect-[4/5]" />;
}
