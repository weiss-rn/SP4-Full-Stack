export default function BlogPage() {
    const { slug } = params;
    return (
        <div>
            <h1>Post Blog: {slug}</h1>
            <p>Kontent detail untuk post dengan slug: **{slug}**</p>
        </div>
    );
}