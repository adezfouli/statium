class Session::SessionsController < ApplicationController


  respond_to :json

  def create
    user = User.find_by_email(params[:user][:email])
    if user && user.authenticate(params[:user][:password])
      session[:user_id] = user.id

      if params[:rememberMe]
        remember_token = User.new_remember_token
        cookies.permanent[:remember_token] = remember_token
        user.update_attribute(:remember_token, User.hash(remember_token))
      end

      render :json=> {:success=>true, user: {:email=>user.email, role: user.role}}
    else
      invalid_login_attempt
    end
  end

  def destroy
    if current_user
      current_user.update_attribute(:remember_token,
                                    User.hash(User.new_remember_token))
      cookies.delete(:remember_token)
      session[:user_id] = nil
    end
    render json: {:success=>true}
  end

  def session_user
    render json: {:success=>true, user: current_user}
  end

  protected
  def ensure_params_exist
    return unless params[:user].blank?
    render :json=>{:success=>false, :message=>"missing user_login parameter"}, status: 422
  end

  def invalid_login_attempt
    render :json=> {:success=>false, :message=>"Error with your login or password"}, status: 401
    end
end