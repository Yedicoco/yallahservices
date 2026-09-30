import { ImageResponse } from 'next/og'

/**
 * Aperçu de partage (WhatsApp, Facebook, LinkedIn…) : c'est lui qui s'affiche quand le lien du site
 * est envoyé dans une conversation, ce qui compte beaucoup pour une activité pilotée via WhatsApp.
 */
export const alt = 'Yallah Services — Le bon profil, au bon endroit.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          // Charte « Concierge » : bleu nuit profond, or chaud, texte blanc.
          background: 'linear-gradient(135deg, #0A1128 0%, #060B1A 100%)',
          color: '#F8FAFC',
          padding: '72px 80px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 52, fontWeight: 900, letterSpacing: -3 }}>
          <span style={{ color: '#D4AF37' }}>yallah</span>
          <span style={{ color: '#FFFFFF' }}>.</span>
          <span style={{ color: '#FFFFFF', marginLeft: 6 }}>services</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 92, lineHeight: 1.05, letterSpacing: -3, fontFamily: 'serif', color: '#FFFFFF' }}>
            Le bon profil,
          </div>
          <div style={{ display: 'flex', fontSize: 92, lineHeight: 1.05, letterSpacing: -3, fontFamily: 'serif', color: '#E5C158' }}>
            au bon endroit.
          </div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 34, color: '#9AABC4' }}>
            Personnel qualifié pour particuliers et entreprises au Maroc
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#D4AF37',
              color: '#0A1128',
              borderRadius: 999,
              padding: '16px 34px',
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            WhatsApp · +212 691 733 585
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#9AABC4' }}>Casablanca · Rabat · Marrakech · Fès · Tanger…</div>
        </div>
      </div>
    ),
    size,
  )
}
