const items = [
  {
    title: "STEM workshop",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Library launch",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Mentor meetup",
    image:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Robotics demo",
    image:
      "https://plus.unsplash.com/premium_photo-1663075913794-6c742d7d6c74?w=900&auto=format&fit=crop&q=60",
  },
];

export default function GalleryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <figure
          key={item.title}
          className="relative rounded-lg overflow-hidden bg-slate-200 aspect-square shadow"
          style={{
            backgroundImage: `url(${item.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <figcaption className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-3 flex items-end text-white text-sm font-semibold drop-shadow">
            {item.title}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
