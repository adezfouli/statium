class ApplicationController < ActionController::Base

  protect_from_forgery


  def verified_request?
    !protect_against_forgery? || request.get? ||
        form_authenticity_token == request.headers['X-XSRF-Token']
  end


  after_filter :set_csrf_cookie_for_ng

  def set_csrf_cookie_for_ng
    cookies['XSRF-TOKEN'] = form_authenticity_token if protect_against_forgery?
  end

  def current_user
    if session[:user_id]
      return User.find(session[:user_id])
    end
    remember_token  = User.hash(cookies[:remember_token])
    User.find_by(remember_token: remember_token)
  end

  helper_method :current_user

  include RecaptchaHelper

end
