/**
 * SMS Provider Interface — pluggable SMS sending for OTP verification.
 * 
 * Swap providers by changing the SMS_PROVIDER env var.
 * Default: 'console' (logs OTP to server console for development).
 */

// ── Interface ────────────────────────────────────────────────

export interface SmsProvider {
  sendOtp(phone: string, code: string): Promise<{ success: boolean; error?: string }>
}

// ── Console Provider (Development) ───────────────────────────

class ConsoleProvider implements SmsProvider {
  async sendOtp(phone: string, code: string) {
    console.log(`\n${'═'.repeat(50)}`)
    console.log(`📱 OTP for ${phone}: ${code}`)
    console.log(`${'═'.repeat(50)}\n`)
    return { success: true }
  }
}

// ── BulkSMSBD Provider ───────────────────────────────────────

class BulkSmsBdProvider implements SmsProvider {
  private apiKey: string
  private senderId: string

  constructor() {
    this.apiKey = process.env.SMS_API_KEY || ''
    this.senderId = process.env.SMS_SENDER_ID || 'Poshra'
  }

  async sendOtp(phone: string, code: string) {
    const formattedPhone = phone.startsWith('88') ? phone : `88${phone}`
    const message = `Your Poshra verification code is ${code}. Valid for 5 minutes. Do not share this code.`

    try {
      const url = new URL('https://bulksmsbd.net/api/smsapi')
      url.searchParams.set('api_key', this.apiKey)
      url.searchParams.set('type', 'text')
      url.searchParams.set('number', formattedPhone)
      url.searchParams.set('senderid', this.senderId)
      url.searchParams.set('message', message)

      const res = await fetch(url.toString())
      const data = await res.json()

      if (data.response_code === 202) {
        return { success: true }
      }
      return { success: false, error: data.error_message || 'SMS sending failed' }
    } catch (err) {
      console.error('BulkSMSBD error:', err)
      return { success: false, error: 'SMS service unavailable' }
    }
  }
}

// ── SSL Wireless Provider ────────────────────────────────────

class SslWirelessProvider implements SmsProvider {
  private apiKey: string
  private senderId: string

  constructor() {
    this.apiKey = process.env.SMS_API_KEY || ''
    this.senderId = process.env.SMS_SENDER_ID || 'Poshra'
  }

  async sendOtp(phone: string, code: string) {
    const formattedPhone = phone.startsWith('88') ? phone : `88${phone}`
    const message = `Your Poshra verification code is ${code}. Valid for 5 minutes.`

    try {
      const res = await fetch('https://smsplus.sslwireless.com/api/v3/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_token: this.apiKey,
          sid: this.senderId,
          msisdn: formattedPhone,
          sms: message,
          csms_id: `otp_${Date.now()}`,
        }),
      })
      const data = await res.json()

      if (data.status === 'SUCCESS') {
        return { success: true }
      }
      return { success: false, error: data.message || 'SMS sending failed' }
    } catch (err) {
      console.error('SSL Wireless error:', err)
      return { success: false, error: 'SMS service unavailable' }
    }
  }
}

// ── sms.net.bd Provider ──────────────────────────────────────

class SmsNetBdProvider implements SmsProvider {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.SMS_API_KEY || ''
  }

  async sendOtp(phone: string, code: string) {
    const formattedPhone = phone.startsWith('88') ? phone : `88${phone}`
    const message = `Your Poshra verification code is ${code}. Valid for 5 minutes.`

    try {
      const url = new URL('https://api.sms.net.bd/sendsms')
      url.searchParams.set('api_key', this.apiKey)
      url.searchParams.set('msg', message)
      url.searchParams.set('to', formattedPhone)

      const res = await fetch(url.toString())
      const data = await res.json()

      if (data.error === 0) {
        return { success: true }
      }
      return { success: false, error: data.msg || 'SMS sending failed' }
    } catch (err) {
      console.error('sms.net.bd error:', err)
      return { success: false, error: 'SMS service unavailable' }
    }
  }
}

// ── Factory ──────────────────────────────────────────────────

const providers: Record<string, () => SmsProvider> = {
  console: () => new ConsoleProvider(),
  bulksmsbd: () => new BulkSmsBdProvider(),
  ssl_wireless: () => new SslWirelessProvider(),
  smsnetbd: () => new SmsNetBdProvider(),
}

let _instance: SmsProvider | null = null

export function getSmsProvider(): SmsProvider {
  if (!_instance) {
    const providerName = process.env.SMS_PROVIDER || 'console'
    const factory = providers[providerName]
    if (!factory) {
      console.warn(`Unknown SMS_PROVIDER "${providerName}", falling back to console`)
      _instance = new ConsoleProvider()
    } else {
      _instance = factory()
    }
  }
  return _instance
}
