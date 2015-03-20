class ContactMailer < ActionMailer::Base
  default from: 'notifications@example.com'

  def contact_us(name, email, message)
    @name = name
    @email = email
    @message = message

    mail(to: "your@gemail.com", subject: '[from datats]')
  end
end