const albums = [
  {
    title: 'School Visits',
    items: [
      {
        title: 'STEM demo day',
        image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Science fair walk-through',
        image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Teacher huddle',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    title: 'Online Classes in Action',
    items: [
      {
        title: 'Live math session',
        image: 'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Doubt clearing breakout',
        image: 'https://images.unsplash.com/photo-1584697964353-4f6c2e06b9af?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Parent orientation',
        image: 'https://images.unsplash.com/photo-1587613864521-9efb0536cdb0?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    title: 'Volunteers at Work',
    items: [
      {
        title: 'Weekend mentors',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Content sprint',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Community call',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  },
  {
    title: 'Student Participation',
    items: [
      {
        title: 'Hands-on robotics',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112c4f3ef5?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Group project showcase',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Presentation day',
        image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  }
];

export default function GalleryPage() {
  return (
    <div className="container py-12 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Gallery</h1>
        <p className="text-slate-700">Visual proof from classrooms, live sessions, volunteers, and student showcases.</p>
      </div>

      <div className="space-y-12">
        {albums.map((album) => (
          <section key={album.title} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold">
                {album.title.split(' ')[0][0]}
              </span>
              <h2 className="text-xl font-semibold">{album.title}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {album.items.map((item) => (
                <figure
                  key={item.title}
                  className="relative overflow-hidden rounded-xl shadow bg-slate-200 aspect-[4/3]"
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
          </section>
        ))}
      </div>
    </div>
  );
}
