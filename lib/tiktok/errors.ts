/** Explications en français des erreurs TikTok les plus courantes (Direct Post / OAuth). */
const HINTS: Record<string, string> = {
  url_ownership_unverified:
    "Le domaine de la vidéo n'est pas vérifié dans TikTok for Developers (Manage apps → URL properties).",
  unaudited_client_can_only_post_to_private_accounts:
    "L'application n'a pas encore passé l'audit TikTok : seule la visibilité « Moi uniquement » est autorisée.",
  access_token_invalid: 'Le jeton TikTok est invalide : reconnectez le compte.',
  scope_not_authorized: "L'autorisation « video.publish » n'a pas été accordée : reconnectez le compte en acceptant toutes les permissions.",
  scope_permission_missed: "L'autorisation « video.publish » manque : reconnectez le compte en acceptant toutes les permissions.",
  rate_limit_exceeded: 'Trop de requêtes envoyées à TikTok : patientez une minute avant de réessayer.',
  spam_risk_too_many_posts: "TikTok signale un trop grand nombre de publications sur la journée : réessayez plus tard.",
  spam_risk_user_banned_from_posting: 'Ce compte TikTok ne peut pas publier pour le moment.',
  reached_active_user_cap: "Le plafond quotidien d'utilisateurs actifs de l'application est atteint.",
  privacy_level_option_mismatch: "Ce niveau de confidentialité n'est pas disponible pour ce compte.",
  duration_check_failed: 'La durée de la vidéo dépasse la limite autorisée pour ce compte.',
  file_format_check_failed: 'Le format de la vidéo est refusé par TikTok (MP4/H.264 recommandé).',
  video_pull_failed: "TikTok n'a pas réussi à télécharger la vidéo depuis l'URL indiquée.",
  invalid_grant: "L'autorisation TikTok a expiré ou a été révoquée : reconnectez le compte.",
}

export function tiktokErrorHint(code: string | undefined): string | undefined {
  return code ? HINTS[code] : undefined
}

/** Codes qui signifient « le compte doit être reconnecté ». */
export function requiresReconnect(code: string | undefined): boolean {
  return code === 'access_token_invalid' || code === 'invalid_grant' || code === 'scope_not_authorized' || code === 'scope_permission_missed'
}
