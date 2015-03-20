namespace :db do
  desc "Fill database with sample data"
  task populate: :environment do
    make_users
  end
end

def make_users

  User.create!(first_name: 'user123', last_name: 'dezfouli', email: 'info@ijware.com',
                       password: 'pass1234',
                       password_confirmation: 'pass1234',
                       role: 'admin')
end