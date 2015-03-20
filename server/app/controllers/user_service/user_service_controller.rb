class  UserService::UserServiceController < ApplicationController

  respond_to :json


  def contact_us
    begin
    ContactMailer.contact_us(params[:name], params[:email], params[:message]).deliver
    render :json=> {:success=>true}
    rescue Net::SMTPAuthenticationError, Net::SMTPServerBusy, Net::SMTPSyntaxError, Net::SMTPFatalError, Net::SMTPUnknownError => e
      render :json => { messages: "ERROR IN SENDING EMAIL" }, :status => 422
    end
  end
end