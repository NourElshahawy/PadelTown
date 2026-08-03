export default function NewsArticleBody({ body }) {
  return (
    <div className="article-body" data-aos="fade-up">
      {body.map((block, i) => {
        if (block.type === "heading") return <h3 key={i}>{block.text}</h3>;
        if (block.type === "quote") {
          return (
            <div className="quote-block" key={i}>
              <p>"{block.text}"</p>
              <span>— {block.cite}</span>
            </div>
          );
        }
        return <p key={i}>{block.text}</p>;
      })}
    </div>
  );
}
