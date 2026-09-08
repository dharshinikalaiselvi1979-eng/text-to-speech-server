// Each voice maps to a real Microsoft Edge neural voice ID
const voices = [
  { name: 'English Voice 1', language: 'en', gender: 'Female', edgeVoice: 'en-US-JennyNeural' },
  { name: 'English Voice 2', language: 'en', gender: 'Male', edgeVoice: 'en-US-GuyNeural' },
  { name: 'Hindi Voice 1', language: 'hi', gender: 'Female', edgeVoice: 'hi-IN-SwaraNeural' },
  { name: 'Hindi Voice 2', language: 'hi', gender: 'Male', edgeVoice: 'hi-IN-MadhurNeural' },
  { name: 'Gujarati Voice 1', language: 'gu', gender: 'Female', edgeVoice: 'gu-IN-DhwaniNeural' },
  { name: 'Gujarati Voice 2', language: 'gu', gender: 'Male', edgeVoice: 'gu-IN-NiranjanNeural' },
  { name: 'Marathi Voice 1', language: 'mr', gender: 'Female', edgeVoice: 'mr-IN-AarohiNeural' },
  { name: 'Marathi Voice 2', language: 'mr', gender: 'Male', edgeVoice: 'mr-IN-ManoharNeural' },
  { name: 'Spanish Voice 1', language: 'es', gender: 'Female', edgeVoice: 'es-ES-ElviraNeural' },
  { name: 'Spanish Voice 2', language: 'es', gender: 'Male', edgeVoice: 'es-ES-AlvaroNeural' },
  { name: 'French Voice 1', language: 'fr', gender: 'Female', edgeVoice: 'fr-FR-DeniseNeural' },
  { name: 'French Voice 2', language: 'fr', gender: 'Male', edgeVoice: 'fr-FR-HenriNeural' },
  { name: 'German Voice 1', language: 'de', gender: 'Female', edgeVoice: 'de-DE-KatjaNeural' },
  { name: 'German Voice 2', language: 'de', gender: 'Male', edgeVoice: 'de-DE-ConradNeural' },
];

const supportedLanguages = [...new Set(voices.map((v) => v.language))];

module.exports = { voices, supportedLanguages };