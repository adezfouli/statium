require 'bcrypt'
require 'net/smtp'

class Users::UsersController < ApplicationController
  include BCrypt

  respond_to :json

  def create
    user  =  User.new(user_params)
    user.role= 'public'
    if verify_recaptcha(request.remote_ip, params)[:status] == 'false'
      render :json => { :errors => {recaptcha: ['The characters you entered didn\'t match the word verification. Please try again.']} }, :status => 422
      return
    end
    if  user.save
      render :json=> {:success=>true}
    else
      render :json => { :errors => user.errors }, :status => 422
    end
  end

  def password_request
    user = User.find_by_email(params[:user][:email])
    if user
      begin
        random_password = Array.new(10).map { (65 + rand(58)).chr }.join
        user.password = random_password
        user.password_confirmation = random_password
        user.save!
        PasswordMailer.send_password(user.first_name, user.email, random_password).deliver
        render :json=> {:success=>true, user: {:email=>user.email}}
      rescue Net::SMTPAuthenticationError, Net::SMTPServerBusy, Net::SMTPSyntaxError, Net::SMTPFatalError, Net::SMTPUnknownError => e
        render :json => { messages: 'ERROR IN SENDING EMAIL' }, :status => 422
      end
    else
      render :json => {  messages: 'Email does not exists' }, :status => 422
    end

  end

  private

  def user_params
    params.require(:user).permit(:first_name, :last_name, :email, :password,
                                 :password_confirmation)
  end

end