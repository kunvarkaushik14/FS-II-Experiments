import { useSelector } from "react-redux";

function PlatformList() {
  const platforms = useSelector(
    (state) => state.platforms.platforms
  );

  return (
    <div className="card">
      <h2>Platforms</h2>

      <ul>
        {platforms.map((platform) => (
          <li key={platform}>{platform}</li>
        ))}
      </ul>
    </div>
  );
}

export default PlatformList;