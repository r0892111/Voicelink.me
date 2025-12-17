{/* Chat Messages (crisper) */}
<div
  className="bg-[#ECE5DD] flex-1 flex flex-col"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    height: '250px',
  }}
>
  {/* Messages Container */}
  <div className="flex-1 px-2 py-2 space-y-2">
    {/* User Voice Message */}
    <div className="flex justify-end">
      <div
        className="bg-[#DCF8C6] rounded-2xl rounded-br-md px-2.5 py-2 max-w-[90%]"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#25D366' }}
          >
            <Play className="w-3 h-3 text-white ml-0.5" />
          </div>

          <div className="flex-1">
            {/* Waveform (crisp + even spacing) */}
            <div className="flex items-center gap-[2px]">
              {[...Array(14)].map((_, i) => {
                const heights = [3, 5, 7, 10, 12, 14, 12, 10, 8, 7, 6, 5, 4, 3];
                const isPlayed = i < 9;
                return (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: '1.6px',
                      height: `${heights[i]}px`,
                      backgroundColor: isPlayed ? '#128C7E' : 'rgba(0,0,0,0.22)',
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="text-[8px] font-semibold text-gray-600">1:23</div>
        </div>

        <div className="flex justify-end items-center gap-1 mt-1">
          <span className="text-[8px] text-gray-500">2:30 PM</span>
          <CheckCircle className="w-2.5 h-2.5 text-[#53BDEB]" />
        </div>
      </div>
    </div>

    {/* Processing Indicator */}
    <div className="flex justify-start">
      <div
        className="bg-white rounded-2xl rounded-bl-md px-2.5 py-2 max-w-[90%]"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 animate-pulse" style={{ color: '#1C2C55' }} />
          <span className="text-[9px] font-semibold" style={{ color: '#1C2C55' }}>
            {t('phoneMockup.aiProcessing')}
          </span>
        </div>
        <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full animate-pulse" style={{ backgroundColor: '#F7E69B', width: '68%' }} />
        </div>
      </div>
    </div>

    {/* VoiceLink Bot Reply */}
    <div className="flex justify-start">
      <div
        className="bg-white rounded-2xl rounded-bl-md px-2.5 py-2.5 max-w-[90%]"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4.5 h-4.5 rounded-full bg-gray-200 flex items-center justify-center p-0.5">
            <img
              src="/Finit Icon Blue.svg"
              alt={t('phoneMockup.voiceLink')}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-[9px] font-bold" style={{ color: '#1C2C55' }}>
            {t('phoneMockup.voiceLink')}
          </span>
        </div>

        <div className="text-[9px] text-gray-800 leading-snug">
          <div className="font-extrabold" style={{ color: '#1C2C55' }}>
            {t('phoneMockup.updatedCrm')}
          </div>

          <div className="mt-1.5 space-y-1 text-[8px]">
            <div>
              📞 <strong>{t('phoneMockup.followUpCall')}</strong>
            </div>
            <div className="ml-3 text-gray-700">• Thursday at 2:00 PM</div>

            <div className="pt-0.5">
              📝 <strong>{t('phoneMockup.keyNotes')}</strong>
            </div>
            <div className="ml-3 text-gray-700">• {t('phoneMockup.strongInterest')}</div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-1 mt-1.5">
          <span className="text-[8px] text-gray-500">2:31 PM</span>
          <CheckCircle className="w-2.5 h-2.5 text-[#53BDEB]" />
        </div>
      </div>
    </div>
  </div>

  {/* WhatsApp Input Area */}
  <div className="flex-shrink-0 px-2 pb-2 pt-1">
    <div
      className="bg-white rounded-full px-2 py-1.5 flex items-center gap-2"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
    >
      <div className="text-gray-400 text-[9px]">😊</div>
      <div className="flex-1 text-[9px] text-gray-500">{t('phoneMockup.typeMessage')}</div>
      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
        <Mic className="w-3 h-3 text-white" />
      </div>
    </div>
  </div>
</div>