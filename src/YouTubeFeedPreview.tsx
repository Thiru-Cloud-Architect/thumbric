type YouTubeFeedPreviewProps = {
  thumbUrl: string
  title: string
  channelName: string
}

export function YouTubeFeedPreview({ thumbUrl, title, channelName }: YouTubeFeedPreviewProps) {
  const displayTitle = title.trim() || 'Your video title appears here'
  return (
    <div className="yt-feed-sim" aria-label="Simulated YouTube home feed">
      <p className="yt-feed-sim-kicker">YouTube feed simulation</p>
      <div className="yt-feed-card">
        <div className="yt-feed-thumb">
          {thumbUrl ? <img src={thumbUrl} alt="" width={320} height={180} /> : null}
          <span className="yt-feed-duration">12:04</span>
        </div>
        <div className="yt-feed-meta">
          <span className="yt-feed-avatar" aria-hidden>
            ▶
          </span>
          <div>
            <p className="yt-feed-title">{displayTitle}</p>
            <p className="yt-feed-channel">{channelName}</p>
            <p className="yt-feed-stats">42K views · 2 days ago</p>
          </div>
        </div>
      </div>
      <div className="yt-feed-sidebar">
        <p className="yt-feed-sidebar-label">Suggested (simulated)</p>
        {[1, 2].map((i) => (
          <div key={i} className="yt-feed-mini">
            <div className="yt-feed-mini-thumb" />
            <div>
              <p className="yt-feed-mini-title">Related video placeholder {i}</p>
              <p className="yt-feed-mini-channel">Creator name</p>
            </div>
          </div>
        ))}
      </div>
      <p className="yt-feed-note">Layout mimic only — not connected to YouTube.</p>
    </div>
  )
}
