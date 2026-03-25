const albums = [
  {
    title: "School Visits",
    items: [
      {
        title: "STEM demo day",
        image:
          "https://images.unsplash.com/photo-1620309732980-a7fd5385b61d?q=80",
      },
      {
        title: "Science fair walk-through",
        image:
          "https://images.unsplash.com/photo-1581929430054-760e30fe5c3b?q=80",
      },
      {
        title: "Teacher huddle",
        image:
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    title: "Online Classes in Action",
    items: [
      {
        title: "Live math session",
        image:
          "https://icdn.isrgrajan.com/in/2020/04/india-online-class-video-calling.jpg?q=80",
      },
      {
        title: "Doubt clearing breakout",
        image:
          "https://indiaeducationdiary.in/wp-content/uploads/2020/09/Picture.jpg?q=80",
      },
      {
        title: "Parent orientation",
        image:
          "https://media.istockphoto.com/id/804145938/photo/indian-women-using-laptop-at-home.jpg?s=612x612&w=0&k=20&c=ZWOzl4tjcr6hftJsRreKI4s-eKMSN-JfOYCzBqwwhE8=",
      },
    ],
  },
  {
    title: "Volunteers at Work",
    items: [
      {
        title: "Weekend mentors",
        image:
          "https://www.pointsoflight.org/wp-content/uploads/2019/05/Naveen-iVolunteer-2.jpg?q=80",
      },
      {
        title: "Content sprint",
        image:
          "https://media.licdn.com/dms/image/v2/D5612AQF57mPG3S6J4g/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1696502015184?e=2147483647&v=beta&t=X-9l3rlA0GX7mQyxDkCRShX0q0F_VVtRYKGldAIjdNI",
      },
      {
        title: "Community call",
        image:
          "https://fonda.asso.fr/sites/default/files/articles/JSW%20Foundation%20Ivolunteer_0.jpg",
      },
    ],
  },
  {
    title: "Student Participation",
    items: [
      {
        title: "Hands-on robotics",
        image:
          "https://images.unsplash.com/photo-1742767069929-0c663150b164?q=80",
      },
      {
        title: "Group project showcase",
        image:
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Presentation day",
        image:
          "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
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
