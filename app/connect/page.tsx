"use client";

import { useEffect, useState } from "react";

type CreatorInfo = {
  connected: boolean;
  data?: {
    creator_avatar_url: string;
    creator_username: string;
    creator_nickname: string;
    privacy_level_options: string[];
    comment_disabled: boolean;
    duet_disabled: boolean;
    stitch_disabled: boolean;
    max_video_post_duration_sec: number;
  };
};

export default function ConnectPage() {
  const [info, setInfo] = useState<CreatorInfo | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [privacyLevel, setPrivacyLevel] = useState("");
  const [disableComment, setDisableComment] = useState(false);
  const [disableDuet, setDisableDuet] = useState(false);
  const [disableStitch, setDisableStitch] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetch("/api/tiktok/creator-info")
      .then((r) => r.json())
      .then((data: CreatorInfo) => {
        setInfo(data);
        if (data.data?.privacy_level_options?.length) {
          setPrivacyLevel(data.data.privacy_level_options[0]);
        }
        // Respecte les réglages du créateur : pas d'option désactivée réactivable.
        if (data.data?.comment_disabled) setDisableComment(true);
        if (data.data?.duet_disabled) setDisableDuet(true);
        if (data.data?.stitch_disabled) setDisableStitch(true);
      });
  }, []);

  async function handlePublish() {
    setPublishing(true);
    setStatus(null);
    try {
      const res = await fetch("/api/tiktok/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          caption,
          privacyLevel,
          disableComment,
          disableDuet,
          disableStitch,
        }),
      });
      const data = await res.json();
      if (data.data?.publish_id) {
        setStatus(`Publication envoyée — publish_id: ${data.data.publish_id}`);
      } else {
        setStatus(`Erreur : ${JSON.stringify(data)}`);
      }
    } catch (e) {
      setStatus("Erreur réseau lors de la publication.");
    } finally {
      setPublishing(false);
    }
  }

  if (!info) return <p style={{ padding: 24 }}>Chargement…</p>;

  if (!info.connected) {
    return (
      <div style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
        <h1>Connecter le compte TikTok</h1>
        <p>Connecte le compte officiel Yallah Services pour publier du contenu.</p>
        <a
          href="/api/tiktok/connect"
          style={{
            display: "inline-block",
            background: "#000",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Connecter TikTok
        </a>
      </div>
    );
  }

  const creator = info.data!;

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <h1>Publier sur TikTok</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <img
          src={creator.creator_avatar_url}
          alt={creator.creator_nickname}
          width={48}
          height={48}
          style={{ borderRadius: "50%" }}
        />
        <div>
          <strong>{creator.creator_nickname}</strong>
          <div>@{creator.creator_username}</div>
        </div>
      </div>

      <label style={{ display: "block", marginBottom: 12 }}>
        URL de la vidéo (doit être hébergée sous yallahservices.vercel.app)
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://yallahservices.vercel.app/videos/promo.mp4"
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 12 }}>
        Légende
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </label>

      <fieldset style={{ marginBottom: 12 }}>
        <legend>Confidentialité</legend>
        {creator.privacy_level_options.map((opt) => (
          <label key={opt} style={{ display: "block" }}>
            <input
              type="radio"
              name="privacy"
              value={opt}
              checked={privacyLevel === opt}
              onChange={() => setPrivacyLevel(opt)}
            />{" "}
            {opt}
          </label>
        ))}
      </fieldset>

      <fieldset style={{ marginBottom: 20 }}>
        <legend>Interactions</legend>
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={disableComment}
            disabled={creator.comment_disabled}
            onChange={(e) => setDisableComment(e.target.checked)}
          />{" "}
          Désactiver les commentaires
        </label>
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={disableDuet}
            disabled={creator.duet_disabled}
            onChange={(e) => setDisableDuet(e.target.checked)}
          />{" "}
          Désactiver les duos
        </label>
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={disableStitch}
            disabled={creator.stitch_disabled}
            onChange={(e) => setDisableStitch(e.target.checked)}
          />{" "}
          Désactiver le stitch
        </label>
      </fieldset>

      <button onClick={handlePublish} disabled={publishing || !videoUrl}>
        {publishing ? "Publication…" : "Publier"}
      </button>

      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </div>
  );
}
