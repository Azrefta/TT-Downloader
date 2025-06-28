function fullReload() {
  window.location.href = location.origin + location.pathname;
}
document.addEventListener("DOMContentLoaded", () => {
  const box = document.createElement("div");
  box.className = "box";
  document.body.appendChild(box);

  async function download() {
    const url = document.getElementById("url").value.trim();
    const output = document.getElementById("output");

    if (!/^https?:\/\/(www\.|vt\.)?tiktok\.com\/.+/.test(url)) {
      output.innerHTML = "⚠️ Invalid TikTok URL.";
      output.style.display = "block";
      return;
    }

    output.style.display = "block";
    output.innerHTML = "⏳ Processing...";

    const inputGroup = document.getElementById("input-group");
    const hint = document.getElementById("hint");

    if (inputGroup) inputGroup.style.display = "none";
    if (hint) hint.style.display = "none";

    const form = new URLSearchParams({ url, hd: "1" });

    try {
      const res = await fetch("https://tikwm.com/api/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0",
          Referer: "https://tikwm.com/",
        },
        body: form
      });

      const data = await res.json();
      if (!data || !data.data) throw new Error("No data returned");

      const video = data.data;
      const title = video.title || "Untitled";

      // Buat URL share
      const shareLink = `${location.origin}${location.pathname}?share=${encodeURIComponent(url)}`;

      output.innerHTML = `
        <h2 class="video-header">By ${video.author.nickname}</h2>
        <video class="video-player" src="${video.play}" controls autoplay loop=false></video>
        <div class="video-result">
          <div class="download-buttons">
            <select id="downloadOption">
              <option value="${video.play}" selected>No Watermark</option>
              <option value="${video.wmplay}">With Watermark</option>
              <option value="${video.music}">Audio Only</option>
            </select>
            <button onclick="downloadTikTok()">Download</button>
            <button onclick="location.reload()">Get it with another video URL</button>
            <button onclick="shareLink('${shareLink}')">Share</button>
          </div>
          <div class="data-container">
            <div class="video-title">${title}</div>
            <p><strong>ID:</strong> ${video.id}</p>
            <p><strong>Region:</strong> ${video.region}</p>
            <p><strong>Duration:</strong> ${video.duration} seconds</p>
            <p><strong>Cover:</strong> <a href="${video.cover}" target="_blank">View</a></p>
            <p><strong>AI Dynamic Cover:</strong> <a href="${video.ai_dynamic_cover}" target="_blank">View</a></p>
            <p><strong>Original Cover:</strong> <a href="${video.origin_cover}" target="_blank">View</a></p>
            <p><strong>Play Count:</strong> ${video.play_count}</p>
            <p><strong>Likes:</strong> ${video.digg_count}</p>
            <p><strong>Comments:</strong> ${video.comment_count}</p>
            <p><strong>Shares:</strong> ${video.share_count}</p>
            <p><strong>Downloads:</strong> ${video.download_count}</p>
            <p><strong>Collects:</strong> ${video.collect_count}</p>
            <p><strong>Create Time:</strong> ${new Date(video.create_time * 1000).toLocaleString()}</p>
            <p><strong>Music Title:</strong> ${video.music_info.title}</p>
            <p><strong>Music Author:</strong> ${video.music_info.author}</p>
            <p><strong>Music URL:</strong> <a href="${video.music_info.play}" target="_blank">Listen</a></p>
            <p><strong>Author ID:</strong> ${video.author.id}</p>
            <p><strong>Author Username:</strong> ${video.author.unique_id}</p>
            <p><strong>Author Avatar:</strong> <a href="${video.author.avatar}" target="_blank">View</a></p>
          </div>
        </div>
      `;
    } catch (err) {
      output.innerHTML = "❌ Failed to process: " + err.message;
      output.style.display = "block";
    }
  }

  function downloadTikTok() {
    const select = document.getElementById("downloadOption");
    const url = select.value;
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function shareLink(link) {
    navigator.clipboard.writeText(link)
      .then(() => alert("✅ Share link copied to clipboard:\n" + link))
      .catch(err => alert("❌ Failed to copy: " + err));
  }

  // Expose functions
  window.download = download;
  window.shareLink = shareLink;

  // Cek parameter `?share=`
  const params = new URLSearchParams(window.location.search);
  const sharedURL = params.get('share');
  if (sharedURL) {
    const input = document.getElementById("url");
    if (input) input.value = sharedURL;
    download();
  }
});