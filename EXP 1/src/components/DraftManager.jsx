function DraftManager({ drafts, setDrafts }) {

  const deleteDraft = (id) => {
    const updated = drafts.filter(
      (draft) => draft.id !== id
    );

    setDrafts(updated);
  };

  return (
    <div className="box">

      <h2>Saved Drafts</h2>

      {drafts.length === 0 ? (
        <p>No Drafts Available</p>
      ) : (
        drafts.map((draft) => (
          <div
            key={draft.id}
            className="draft"
          >
            <h3>{draft.platform}</h3>

            <p>{draft.text}</p>

            <button
              onClick={() => deleteDraft(draft.id)}
            >
              Delete
            </button>

          </div>
        ))
      )}

    </div>
  );
}

export default DraftManager;