module RecaptchaHelper
  require "net/http"

  RECAPTCHA_PRIVATE_KEY = '6LdYse8SAAAAAIIoGz3U3l4oXtuwviB9n-ZFF3EB';

  #try and verify the captcha response. Then give out a message to flash
  def verify_recaptcha(remote_ip, params)


    responce = Net::HTTP.post_form(URI.parse('http://www.google.com/recaptcha/api/verify'),
                                   {'privatekey'=>RECAPTCHA_PRIVATE_KEY, 'remoteip'=>remote_ip, 'challenge'=>params[:recaptcha_challenge_field], 'response'=> params[:recaptcha_response_field]})
    result = {:status => responce.body.split("\n")[0], :error_code => responce.body.split("\n")[1]}

    result
  end
end