function PlatformSelector({ platform, setPlatform }) {
  return (
    <select
      value={platform}
      onChange={(e) => setPlatform(e.target.value)}
    >
      <option value="Twitter">Twitter</option>
      <option value="LinkedIn">LinkedIn</option>
      <option value="Instagram">Instagram</option>
    </select>
  );
}

export default PlatformSelector;