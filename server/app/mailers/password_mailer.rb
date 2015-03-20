class PasswordMailer < ActionMailer::Base
  default from: 'notifications@example.com'

  def send_password(name, email, password)
    @name = name
    @email = email
    @password = password

    mail(to: email, subject: 'Your password')
  end
end