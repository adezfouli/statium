class Static::StaticController < ApplicationController

  def index

    if params[:res]
      send_file "#{Rails.root}/public/" + params[:res], :disposition => 'inline'
    end

    if params[:name]
      send_file "#{Rails.root}/public/index.html", :disposition => 'inline'
    end
  end
end